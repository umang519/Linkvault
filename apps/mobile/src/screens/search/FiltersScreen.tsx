import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

// Design ref: Screen.dc.html — is.filters. Presented as a modal bottom
// sheet over whichever screen opened it (Home, Search, Category detail).
// Footer must show the live resulting count before the user commits
// (PROJECT.md §14.8) — needs a count-only query from the API.
export function FiltersScreen() {
  return <PlaceholderScreen title="Filter & sort" note="Category, sub-category, tags, status, date, source, favorites, sort — footer shows live result count" />;
}
