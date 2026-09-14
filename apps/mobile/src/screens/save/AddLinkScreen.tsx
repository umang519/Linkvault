import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

// Design ref: Screen.dc.html — is.add / is.addLoading / is.metaFail /
// is.invalidUrl / is.duplicate / is.share are states of this one flow:
// URL is the only required, only-red field; metadata fetch is
// non-blocking (user can keep filling category/tags/notes while it
// runs); failure falls back to a required title + retry; an invalid URL
// suggests the corrected form; a duplicate shows the existing link
// (Open Existing / Save Anyway). `is.share` is the OS share-sheet
// variant of this same screen — reachable from the phone's native share
// target, not by in-app navigation; PLAN.md §1.6 tracks the native
// share-extension wiring separately. Suggested category/tag chips
// support double-tap-to-save (PROJECT.md §14.9).
export function AddLinkScreen() {
  return <PlaceholderScreen title="Save link" note="URL required; category/tags/status/notes optional; auto-fetched metadata; duplicate + invalid-URL + fetch-failed states" />;
}
