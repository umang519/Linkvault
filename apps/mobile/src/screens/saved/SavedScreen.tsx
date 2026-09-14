import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

// Design ref: Screen.dc.html — is.favorites / is.emptyFav / is.status are
// states/tabs of this one route (tab bar's "Saved" maps to Favorites by
// default; Status/"To read" is reachable within). Status rows get a
// swipe-to-advance gesture AND a long-press fallback menu with the same
// options (PROJECT.md §14.9 — accessibility).
export function SavedScreen() {
  return <PlaceholderScreen title="Saved" note="Favorites (default) and Status/'To read', with the Favorite-vs-Status distinction explained in the empty state" />;
}
