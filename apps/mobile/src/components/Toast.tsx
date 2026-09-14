import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';

/**
 * Save-confirmation toast with Undo/View actions (PROJECT.md §14.5).
 * Purely presentational — the caller owns visibility/timing (see
 * HomeScreen's saved-toast state for the pattern: show on a
 * `route.params.justSaved` payload, auto-dismiss after a few seconds).
 */
export function Toast({
  title,
  subtitle,
  onUndo,
  onView,
}: {
  title: string;
  subtitle?: string;
  onUndo?: () => void;
  onView?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.toast, { backgroundColor: colors.ink }]}>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.bg }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.bg }]}>{subtitle}</Text> : null}
      </View>
      {onUndo ? (
        <Pressable onPress={onUndo}>
          <Text style={[styles.undo, { color: colors.bg }]}>UNDO</Text>
        </Pressable>
      ) : null}
      {onView ? (
        <Pressable onPress={onView} style={[styles.viewBtn, { backgroundColor: colors.accent }]}>
          <Text style={[styles.viewText, { color: colors.inverse }]}>VIEW</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  text: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.heading, fontSize: 12.5, letterSpacing: 0.4 },
  subtitle: { fontFamily: fonts.body, fontSize: 11.5, opacity: 0.75, marginTop: 3 },
  undo: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.8 },
  viewBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  viewText: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.8 },
});
