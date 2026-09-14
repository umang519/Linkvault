import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

// Design ref: Screen.dc.html — is.detail. Open Link is the widest,
// reddest element on screen; metadata renders as a ruled label/value
// table; Status is tap-to-change here (consistent with the long-press
// fallback on the Saved/Status screen, PROJECT.md §14.9).
export function LinkDetailScreen() {
  return <PlaceholderScreen title="Link detail" note="URL, category, tags, status, notes, added/last-opened; Open Link / Edit / Delete" />;
}
