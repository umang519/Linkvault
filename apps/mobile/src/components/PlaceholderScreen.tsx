import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from './ScreenContainer';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, type } from '../theme/tokens';

/**
 * Stand-in for a screen that hasn't been built yet. Every route in the
 * navigator resolves to a real component (never a 404), so the app runs
 * end-to-end from day one — fill these in against
 * `Mobile app design prompt/Screen.dc.html` one at a time per PLAN.md §1.5.
 */
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  const { colors } = useTheme();
  return (
    <ScreenContainer style={styles.center}>
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
      {note ? <Text style={[styles.note, { color: colors.muted }]}>{note}</Text> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  title: { fontFamily: fonts.heading, fontSize: type.section, textAlign: 'center' },
  note: { fontFamily: fonts.body, fontSize: type.body, textAlign: 'center' },
});
