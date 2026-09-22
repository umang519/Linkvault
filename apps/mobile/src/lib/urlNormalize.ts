/**
 * URL validation/normalization for the Add Link flow — PROJECT.md §7.2:
 * "Normalize URLs before comparison (strip tracking params, trailing
 * slashes, etc.)". No network calls here; this is pure string/URL work
 * usable both for the duplicate check and the "Normalised · N params
 * stripped" badge shown on the Add Link screen.
 */

const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'igshid', 'mc_cid', 'mc_eid', 'ref',
];

export function isValidUrl(input: string): boolean {
  const raw = input.trim();
  if (!raw) return false;
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withScheme);
    if (!/^https?:$/i.test(u.protocol)) return false;
    return u.hostname.includes('.') && u.hostname.length > 3;
  } catch {
    return false;
  }
}

/** Best-effort fix for a common scheme typo or a missing scheme — returns null if it can't suggest one. */
export function suggestUrlFix(input: string): string | null {
  const raw = input.trim();
  if (!raw || isValidUrl(raw)) return null;

  const schemeFixed = raw.replace(/^h?tt?ps?:\/*/i, 'https://');
  if (schemeFixed !== raw && isValidUrl(schemeFixed)) return schemeFixed;

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) && /\.[a-z]{2,}/i.test(raw)) {
    const withScheme = `https://${raw}`;
    if (isValidUrl(withScheme)) return withScheme;
  }
  return null;
}

export function normalizeUrl(raw: string): { normalized: string; strippedCount: number } {
  try {
    const withScheme = raw.includes('://') ? raw : `https://${raw}`;
    const u = new URL(withScheme);
    let strippedCount = 0;
    for (const p of TRACKING_PARAMS) {
      if (u.searchParams.has(p)) {
        u.searchParams.delete(p);
        strippedCount++;
      }
    }
    const path = u.pathname.replace(/\/+$/, '') || '/';
    const search = u.searchParams.toString();
    const normalized = `${u.hostname.replace(/^www\./, '')}${path}${search ? `?${search}` : ''}`.toLowerCase();
    return { normalized, strippedCount };
  } catch {
    return { normalized: raw.trim().toLowerCase().replace(/\/+$/, ''), strippedCount: 0 };
  }
}

/** Best-effort title guess standing in for real metadata fetching (V2, PROJECT.md §7.1) — derives from the URL's last path segment or hostname. */
export function guessTitleFromUrl(raw: string): string {
  try {
    const u = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const segment = u.pathname.split('/').filter(Boolean).pop();
    if (segment) {
      return segment
        .replace(/\.\w+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return u.hostname.replace(/^www\./, '');
  } catch {
    return raw;
  }
}
