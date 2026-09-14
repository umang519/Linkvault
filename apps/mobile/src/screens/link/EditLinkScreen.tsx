import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

// Design ref: Screen.dc.html — is.edit / is.deleteConfirm. Same field
// order as Add, prefilled; Delete kept small and to the side, opens the
// one confirmation dialog in the app.
export function EditLinkScreen() {
  return <PlaceholderScreen title="Edit link" note="Same fields as Add, prefilled; Delete opens a confirmation dialog" />;
}
