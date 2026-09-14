import type { Link } from '../types/models';

/**
 * Placeholder data standing in for `GET /links` until apps/api exists.
 * Shared across screens (Home, Search, …) so there's one dataset to
 * swap out, not one per screen. Titles/tags mirror the sample set in
 * Mobile app design prompt/Screen.dc.html for consistency with the
 * design reference.
 */
export const mockLinks: Link[] = [
  {
    id: 'ipo',
    userId: 'u1',
    title: 'IPO GMP Live — Grey Market Premium Tracker',
    url: 'https://investorgain.com/report/ipo-gmp-live/331/',
    description: 'Live grey-market premium table for every open and upcoming IPO.',
    favicon: null,
    previewImage: null,
    categoryId: 'c-finance-stocks',
    tags: [tag('ipo'), tag('gmp'), tag('tracker')],
    status: 'To Read',
    isFavorite: true,
    notes: null,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    lastOpenedAt: null,
  },
  {
    id: 'usememo',
    userId: 'u1',
    title: 'useMemo & useCallback, properly explained',
    url: 'https://youtube.com/watch?v=THL1OPn72vo',
    description: '38 min — when memoisation actually helps and when it just costs you.',
    favicon: null,
    previewImage: null,
    categoryId: 'c-dev-react',
    tags: [tag('react'), tag('performance')],
    status: 'Unread',
    isFavorite: false,
    notes: 'Watch before refactoring the link list — the memo on LinkRow is probably pointless.',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    lastOpenedAt: null,
  },
  {
    id: 'chatgpt',
    userId: 'u1',
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    description: 'Daily driver. Kept here so it survives a browser reinstall.',
    favicon: null,
    previewImage: null,
    categoryId: 'c-other-tools',
    tags: [tag('ai'), tag('daily')],
    status: 'Reference',
    isFavorite: true,
    notes: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    lastOpenedAt: daysAgo(1),
  },
  {
    id: 'expo',
    userId: 'u1',
    title: 'Expo Router — file-based routing',
    url: 'https://docs.expo.dev/router/introduction/',
    description: 'Nested layouts and typed routes for the LinkVault app shell.',
    favicon: null,
    previewImage: null,
    categoryId: 'c-dev-react',
    tags: [tag('expo'), tag('react-native')],
    status: 'Reading',
    isFavorite: true,
    notes: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    lastOpenedAt: null,
  },
  {
    id: 'varsity',
    userId: 'u1',
    title: 'Varsity: Mutual Funds, Chapter 4',
    url: 'https://zerodha.com/varsity/chapter/the-mutual-fund-structure/',
    description: 'How the AMC, trustee and custodian actually split responsibilities.',
    favicon: null,
    previewImage: null,
    categoryId: 'c-finance-mf',
    tags: [tag('mutual-funds'), tag('basics')],
    status: 'Reading',
    isFavorite: false,
    notes: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    lastOpenedAt: null,
  },
  {
    id: 'prisma',
    userId: 'u1',
    title: 'Prisma — relation queries and nested writes',
    url: 'https://prisma.io/docs/orm/prisma-client/queries/relation-queries',
    description: 'Needed for the LinkTag join table.',
    favicon: null,
    previewImage: null,
    categoryId: 'c-dev-node',
    tags: [tag('prisma'), tag('postgres')],
    status: 'To Read',
    isFavorite: false,
    notes: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    lastOpenedAt: null,
  },
];

function tag(name: string) {
  return { id: `t-${name}`, userId: 'u1', name };
}
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}
function daysAgo(d: number) {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

/** All tags used across `links`, sorted by frequency (desc). Shared by
 * Search (top tags) and Browse's Tags list — one counting pass, not one
 * per screen. */
export function tagCounts(links: Link[] = mockLinks): { name: string; n: number }[] {
  const counts = new Map<string, number>();
  for (const l of links) for (const t of l.tags) counts.set(t.name, (counts.get(t.name) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));
}

/** Links whose `categoryId` is exactly this sub-category id. */
export function linksInCategory(categoryId: string, links: Link[] = mockLinks): Link[] {
  return links.filter((l) => l.categoryId === categoryId);
}
