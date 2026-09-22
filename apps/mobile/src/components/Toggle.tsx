import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { ruleWidth } from '../theme/tokens';

/**
 * On/off switch matching the Modernist token set — PROJECT.md §14.5 lists
 * a "toggle" in the component inventory, but RN's built-in `Switch` is a
 * rounded pill that can't honor "no border-radius anywhere" (§14.1), so
 * this is a square rule-bordered track with a sliding accent-filled thumb
 * instead. Used by the Favorite field (Add/Edit link) and "Favorites
 * only" (Filters).
 */
export function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[
        styles.track,
        { borderColor: colors.rule, backgroundColor: value ? colors.accent : 'transparent' },
      ]}
    >
      <View
        style={[
          styles.thumb,
          { backgroundColor: value ? colors.inverse : colors.rule, alignSelf: value ? 'flex-end' : 'flex-start' },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 44, height: 24, borderWidth: ruleWidth, padding: 2, justifyContent: 'center' },
  thumb: { width: 14, height: 14 },
});
