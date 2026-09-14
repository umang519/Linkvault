import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

// Design ref: Screen.dc.html — is.searchIdle / is.search / is.noResults are
// states of this one route (idle → typing → results → zero-results), not
// separate screens. Filter sheet (is.filters) is a separate modal route.
export function SearchScreen() {
  return <PlaceholderScreen title="Search" note="Idle: recent searches + top tags. Typing: results with filter-count button. Empty: names the fields searched." />;
}
