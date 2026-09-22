/**
 * Client-side mirror of the data model in PROJECT.md §3. Keep this in
 * sync with prisma/schema.prisma once apps/api exists — this file is
 * the mobile app's view of the same shapes, not a separate design.
 */

// PROJECT.md §6 — fixed workflow sequence, not freeform text.
// Status and Favorite are separate axes (CLAUDE.md "Conventions to
// follow") — never conflate them into one field or one UI control.
export type LinkStatus =
  | 'Unread'
  | 'To Read'
  | 'Reading'
  | 'Read'
  | 'Reference'
  | 'Archived';

// The fixed order status moves through — status pickers and the
// Saved/Status swipe-to-advance gesture both walk this array rather
// than hardcoding the sequence per call site.
export const STATUS_SEQUENCE: LinkStatus[] = [
  'Unread',
  'To Read',
  'Reading',
  'Read',
  'Reference',
  'Archived',
];

export interface Category {
  id: string;
  userId: string;
  name: string;
  parentId: string | null; // sub-categories, PROJECT.md §3.3
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
}

export interface Link {
  id: string;
  userId: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  previewImage: string | null;
  categoryId: string | null;
  tags: Tag[];
  status: LinkStatus;
  isFavorite: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// PROJECT.md §5.2 — filters AND together; this shape is also what
// Smart Collections (§8, V2) will end up saving under a name.
export interface LinkFilter {
  search?: string;
  categoryId?: string;
  tagIds?: string[];
  status?: LinkStatus;
  isFavorite?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sort?: 'newest' | 'oldest' | 'lastOpened' | 'titleAsc';
}
