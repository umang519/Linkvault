import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STATUS_SEQUENCE, type LinkStatus } from '../types/models';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, hairlineWidth } from '../theme/tokens';
import { Dialog } from './Dialog';

/**
 * Status picker used by both Link Detail's "tap to change" status row and
 * the Saved/Status screen's long-press fallback menu — PROJECT.md §14.9
 * requires the swipe gesture there to have a non-gesture equivalent, and
 * this is the same control Link Detail already needed, factored once.
 */
export function StatusPickerDialog({
  visible,
  current,
  onClose,
  onSelect,
}: {
  visible: boolean;
  current: LinkStatus;
  onClose: () => void;
  onSelect: (status: LinkStatus) => void;
}) {
  const { colors } = useTheme();

  return (
    <Dialog visible={visible} onClose={onClose} position="bottom">
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: colors.ink }]}>Set status</Text>
        {STATUS_SEQUENCE.map((s, i) => {
          const active = s === current;
          return (
            <Pressable
              key={s}
              onPress={() => {
                onSelect(s);
                onClose();
              }}
              style={[
                styles.row,
                i > 0 && { borderTopWidth: hairlineWidth, borderTopColor: colors.line },
              ]}
            >
              <Text style={[styles.label, { color: active ? colors.accent : colors.ink }]}>{s}</Text>
              {active ? <Text style={[styles.check, { color: colors.accent }]}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
  title: { fontFamily: fonts.heading, fontSize: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
  label: { fontFamily: fonts.body, fontSize: 14.5 },
  check: { fontFamily: fonts.heading, fontSize: 14 },
});
