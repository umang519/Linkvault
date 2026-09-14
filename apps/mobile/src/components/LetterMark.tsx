import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';

/**
 * The ruled square with a single letter that stands in for a favicon
 * throughout the design (LinkRow, Link Detail, Settings avatar, the
 * duplicate dialog, Status rows) — PROJECT.md §14.1 ("no icons").
 */
export function LetterMark({
  letter,
  size = 34,
}: {
  letter: string;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.mark,
        { width: size, height: size, borderColor: colors.rule },
      ]}
    >
      <Text style={[styles.text, { color: colors.ink, fontSize: size * 0.44 }]}>
        {letter.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

export function domainInitial(url: string): string {
  try {
    const host = new URL(url.includes('://') ? url : `https://${url}`).hostname;
    return host.replace(/^www\./, '').charAt(0).toUpperCase() || '?';
  } catch {
    return '?';
  }
}

const styles = StyleSheet.create({
  mark: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.heading },
});
