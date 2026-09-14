import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

// Design ref: Screen.dc.html — is.categories / is.tags / is.collections are
// one segmented view switched by a chip row, defaulting to Categories
// per PROJECT.md §14.9 (Categories → Collections → Tags).
export function BrowseScreen() {
  return <PlaceholderScreen title="Browse" note="Defaults to Categories; Collections and Tags one chip-tap away, in that order" />;
}
