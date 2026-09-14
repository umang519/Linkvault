import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

// Design ref: Screen.dc.html — is.settings ("You" tab)
// Note: import/export, backup & sync and biometric lock are shown in the
// design for shell completeness but are V2/out-of-scope for v1 — keep
// those rows non-functional or hidden until their owning phase
// (PROJECT.md §14.8, PLAN.md Phase 2).
export function SettingsScreen() {
  return <PlaceholderScreen title="Settings" note="Profile, appearance (Light/Dark/System), defaults, sync, import/export, security, about, logout" />;
}
