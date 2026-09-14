import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, hairlineWidth } from '../theme/tokens';

/**
 * Equal-width row of options with left-border dividers, one active
 * (accent fill). Used for the Status row on Add/Edit link and the
 * Appearance row on Settings — PROJECT.md §14.6.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderColor: colors.line }]}>
      {options.map((opt, i) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.segment,
              i > 0 && { borderLeftWidth: hairlineWidth, borderLeftColor: colors.line },
              active && { backgroundColor: colors.accent },
            ]}
          >
            <Text style={[styles.label, { color: active ? colors.inverse : colors.ink }]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderWidth: hairlineWidth },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  label: { fontFamily: fonts.body, fontSize: 11.5 },
});
