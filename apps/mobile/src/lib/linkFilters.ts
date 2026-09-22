import type { Link, LinkStatus } from '../types/models';

/**
 * Client-side stand-in for the `GET /links?search=&category=&tag=&status=…`
 * query described in PROJECT.md §5 — used by both Search (text query) and
 * Filters (structured criteria) so there's one AND-combining implementation
 * to swap for a real API call later (PLAN.md §1.4), not two that could
 * drift apart. `categoryIds` is OR'd (matches any of these leaf category
 * ids — Filters resolves "Development" with no sub-category chosen into
 * all of Development's sub-category ids before calling this); every other
 * field ANDs together.
 */
export interface LinkFilterState {
  search?: string;
  categoryIds?: string[];
  tagIds?: string[];
  status?: LinkStatus;
  isFavorite?: boolean;
  dateFrom?: string; // ISO — createdAt on/after this
  source?: string; // hostname, e.g. "youtube.com"
  sort?: 'newest' | 'oldest' | 'lastOpened' | 'titleAsc';
}

export function matchesSearchText(link: Link, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [link.title, link.url, link.description ?? '', link.notes ?? '', ...link.tags.map((t) => t.name)]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

export function linkHostname(url: string): string {
  try {
    return new URL(url.includes('://') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function applyLinkFilter(links: Link[], f: LinkFilterState): Link[] {
  return links.filter((l) => {
    if (f.search && !matchesSearchText(l, f.search)) return false;
    if (f.categoryIds && f.categoryIds.length > 0 && !f.categoryIds.includes(l.categoryId ?? '')) return false;
    if (f.tagIds && f.tagIds.length > 0) {
      const linkTagIds = l.tags.map((t) => t.id);
      if (!f.tagIds.every((id) => linkTagIds.includes(id))) return false;
    }
    if (f.status && l.status !== f.status) return false;
    if (f.isFavorite && !l.isFavorite) return false;
    if (f.dateFrom && l.createdAt < f.dateFrom) return false;
    if (f.source && linkHostname(l.url) !== f.source) return false;
    return true;
  });
}

export function sortLinks(links: Link[], sort?: LinkFilterState['sort']): Link[] {
  const arr = [...links];
  switch (sort) {
    case 'oldest':
      return arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'lastOpened':
      return arr.sort((a, b) => (b.lastOpenedAt ?? '').localeCompare(a.lastOpenedAt ?? ''));
    case 'titleAsc':
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case 'newest':
    default:
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/** How many of a LinkFilterState's criteria are actively narrowing results — drives the filter-count badge on Search. */
export function activeFilterCount(f: LinkFilterState): number {
  let n = 0;
  if (f.categoryIds && f.categoryIds.length > 0) n++;
  if (f.tagIds && f.tagIds.length > 0) n++;
  if (f.status) n++;
  if (f.isFavorite) n++;
  if (f.dateFrom) n++;
  if (f.source) n++;
  return n;
}
