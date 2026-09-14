import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { ruleWidth } from '../theme/tokens';

/**
 * Full-height-ish modal sheet sliding from the bottom — used by the
 * Filter & sort sheet (PROJECT.md §14.6). Dim overlay tap-to-dismiss +
 * a decorative drag handle (no drag gesture in v1 — reanimated isn't
 * installed; add it if a future screen needs a real drag-to-dismiss).
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  heightPct = 0.82,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightPct?: number;
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { height: `${heightPct * 100}%`, backgroundColor: colors.bg, borderTopColor: colors.rule },
        ]}
      >
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: colors.line }]} />
        </View>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(24,23,22,0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopWidth: ruleWidth,
  },
  handleRow: { alignItems: 'center', paddingTop: 10 },
  handle: { width: 46, height: 3 },
});
