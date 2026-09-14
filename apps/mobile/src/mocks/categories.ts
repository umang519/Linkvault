import type { Category } from '../types/models';
import { linksInCategory } from './links';

/**
 * Placeholder data standing in for `GET /categories` until apps/api
 * exists. Seeded from the starter taxonomy in PROJECT.md §4. Top-level
 * categories have `parentId: null`; sub-categories point at their
 * parent's id — mirrors the real schema (PROJECT.md §3.3) so this swaps
 * for a real query later without restructuring callers.
 */
export const mockCategories: Category[] = [
  cat('c-dev', 'Development'),
  sub('c-dev-react', 'React', 'c-dev'),
  sub('c-dev-js', 'JavaScript', 'c-dev'),
  sub('c-dev-ts', 'TypeScript', 'c-dev'),
  sub('c-dev-node', 'Node.js', 'c-dev'),
  sub('c-dev-aws', 'AWS', 'c-dev'),
  sub('c-dev-git', 'Git', 'c-dev'),
  sub('c-dev-salesforce', 'Salesforce', 'c-dev'),

  cat('c-finance', 'Finance'),
  sub('c-finance-mf', 'Mutual Funds', 'c-finance'),
  sub('c-finance-stocks', 'Stocks', 'c-finance'),
  sub('c-finance-tax', 'Tax', 'c-finance'),
  sub('c-finance-insurance', 'Insurance', 'c-finance'),
  sub('c-finance-pf', 'Personal Finance', 'c-finance'),

  cat('c-learning', 'Learning'),
  sub('c-learning-courses', 'Courses', 'c-learning'),
  sub('c-learning-articles', 'Articles', 'c-learning'),
  sub('c-learning-docs', 'Documentation', 'c-learning'),
  sub('c-learning-books', 'Books', 'c-learning'),
  sub('c-learning-youtube', 'YouTube', 'c-learning'),

  cat('c-entertainment', 'Entertainment'),
  sub('c-ent-movies', 'Movies', 'c-entertainment'),
  sub('c-ent-series', 'Series', 'c-entertainment'),
  sub('c-ent-music', 'Music', 'c-entertainment'),
  sub('c-ent-games', 'Games', 'c-entertainment'),

  cat('c-shopping', 'Shopping'),
  sub('c-shopping-products', 'Products', 'c-shopping'),
  sub('c-shopping-deals', 'Deals', 'c-shopping'),
  sub('c-shopping-wishlist', 'Wishlist', 'c-shopping'),

  cat('c-other', 'Other'),
  sub('c-other-tools', 'Tools', 'c-other'),
];

function cat(id: string, name: string): Category {
  return { id, userId: 'u1', name, parentId: null };
}
function sub(id: string, name: string, parentId: string): Category {
  return { id, userId: 'u1', name, parentId };
}

export function topLevelCategories(): Category[] {
  return mockCategories.filter((c) => c.parentId === null);
}
export function subCategoriesOf(categoryId: string): Category[] {
  return mockCategories.filter((c) => c.parentId === categoryId);
}
export function categoryById(id: string): Category | undefined {
  return mockCategories.find((c) => c.id === id);
}

/** Link count for a category — direct count for a sub-category (leaf),
 * summed across children for a top-level category. */
export function linkCountForCategory(categoryId: string): number {
  const subs = subCategoriesOf(categoryId);
  if (subs.length === 0) return linksInCategory(categoryId).length;
  return subs.reduce((sum, s) => sum + linksInCategory(s.id).length, 0);
}
