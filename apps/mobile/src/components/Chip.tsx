import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';

type ChipVariant = 'solid' | 'outline' | 'dashed';

/**
 * Generic pill chip — covers filter chips (Filter & sort sheet, Category
 * detail sub-category chips) and tag chips (Add/Edit link "+ add tag",
 * selected tag with " ×"). PROJECT.md §14.5.
 *
 * Not used for the small uppercase status badge on LinkRow (see
 * StatusBadge.tsx) or the equal-width status/appearance row (see
 * SegmentedControl.tsx) — those have distinct layouts in the design,
 * not just a color variant of this pill.
 */
export function Chip({
  label,
  active = false,
  variant = 'outline',
  onPress,
  style,
}: {
  label: string;
  active?: boolean;
  variant?: ChipVariant;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();

  const isSolid = variant === 'solid' || active;
  const isDashed = variant === 'dashed';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        isSolid
          ? { backgroundColor: colors.accent, borderColor: colors.accent }
          : {
              backgroundColor: 'transparent',
              borderColor: colors.line,
              borderStyle: isDashed ? 'dashed' : 'solid',
            },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: isSolid ? colors.inverse : isDashed ? colors.muted : colors.ink },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1 },
  label: { fontFamily: fonts.body, fontSize: 12 },
});
