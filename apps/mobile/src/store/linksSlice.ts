import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mockLinks } from '../mocks/links';
import type { Link, LinkStatus } from '../types/models';
import type { RootState } from './index';

/**
 * Local "database" standing in for `GET/POST/PATCH/DELETE /links` until
 * apps/api exists. Seeded from mocks/links.ts once, then mutated in place
 * so Favorite/Status/Add/Edit/Delete are visible across every screen that
 * reads from here (Home, Search, Browse, Saved) instead of each screen
 * holding its own copy. Swap this slice for RTK Query cache entries once
 * the real API lands — the shape screens read (`Link[]`) doesn't change.
 */
const linksSlice = createSlice({
  name: 'links',
  initialState: mockLinks as Link[],
  reducers: {
    addLink(state, action: PayloadAction<Link>) {
      state.unshift(action.payload);
    },
    updateLink(state, action: PayloadAction<Link>) {
      const i = state.findIndex((l) => l.id === action.payload.id);
      if (i !== -1) state[i] = action.payload;
    },
    deleteLink(state, action: PayloadAction<string>) {
      return state.filter((l) => l.id !== action.payload);
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const link = state.find((l) => l.id === action.payload);
      if (link) link.isFavorite = !link.isFavorite;
    },
    setStatus(state, action: PayloadAction<{ id: string; status: LinkStatus }>) {
      const link = state.find((l) => l.id === action.payload.id);
      if (link) link.status = action.payload.status;
    },
  },
});

export const { addLink, updateLink, deleteLink, toggleFavorite, setStatus } = linksSlice.actions;
export default linksSlice.reducer;

export function selectAllLinks(state: RootState): Link[] {
  return state.links;
}
export function selectLinkById(id: string | undefined) {
  return (state: RootState): Link | undefined => (id ? state.links.find((l) => l.id === id) : undefined);
}
