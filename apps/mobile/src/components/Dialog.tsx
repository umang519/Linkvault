import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { ruleWidth } from '../theme/tokens';

/**
 * Small floating dialog over a dim overlay — used by Delete confirmation
 * and the Duplicate-detected dialog (PROJECT.md §14.6). Distinct from
 * BottomSheet: fixed-position card with side insets, not a full sheet.
 */
export function Dialog({
  visible,
  onClose,
  children,
  position = 'bottom',
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 'bottom' = Delete confirmation (pinned above the tab area); 'center' = Duplicate dialog. */
  position?: 'bottom' | 'center';
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View
        style={[
          styles.card,
          position === 'bottom' ? styles.bottom : styles.center,
          { backgroundColor: colors.bg, borderColor: colors.rule },
        ]}
      >
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(24,23,22,0.5)' },
  card: { position: 'absolute', left: 16, right: 16, borderWidth: ruleWidth },
  bottom: { bottom: 26 },
  center: { top: '30%' },
});
