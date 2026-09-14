import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';
import type { LinkStatus } from '../types/models';

/**
 * Small uppercase status badge used inline on LinkRow and Link Detail —
 * solid accent for Unread (the state that most wants attention), outlined
 * for everything else. Distinct component from Chip (different sizing/
 * always-uppercase/tracked) even though visually similar — see the note
 * in Chip.tsx.
 */
export function StatusBadge({ status }: { status: LinkStatus }) {
  const { colors } = useTheme();
  const isUnread = status === 'Unread';

  return (
    <View
      style={[
        styles.badge,
        isUnread
          ? { backgroundColor: colors.accent, borderColor: colors.accent }
          : { borderColor: colors.line },
      ]}
    >
      <Text style={[styles.text, { color: isUnread ? colors.inverse : colors.muted }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 6, paddingVertical: 4, borderWidth: 1 },
  text: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 0.8 },
});
