import { useEffect, useState } from 'react';
import { selectAllLinks } from '../store/linksSlice';
import { useAppSelector } from '../store/hooks';
import type { Link } from '../types/models';

/**
 * Stand-in for `useGetLinksQuery()` (RTK Query, once apps/api exists).
 * Shaped the same way on purpose — `{ data, isLoading }` — so screens
 * built against this today don't need restructuring later, only a
 * swapped import. Simulates network latency so the loading/skeleton
 * states are real states to build and see, not dead code. Reads from
 * the `links` Redux slice (not a static array) so adds/edits/deletes
 * made elsewhere in the app show up here too.
 */
export function useMockLinks(delayMs = 600): { data: Link[]; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(true);
  const links = useAppSelector(selectAllLinks);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return { data: isLoading ? [] : links, isLoading };
}
