import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';
import { Dialog } from './Dialog';

/**
 * The one confirmation dialog in the app (PROJECT.md §14.6) — opened
 * identically from Link Detail's DELETE and Edit Link's DELETE, so it's
 * factored once here rather than duplicated. Design ref: is.deleteConfirm.
 */
export function DeleteLinkDialog({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Dialog visible={visible} onClose={onClose} position="bottom">
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: colors.ink }]}>Delete this link?</Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          Notes and tags go with it. This can't be undone after the toast disappears.
        </Text>
        <View style={styles.row}>
          <Pressable onPress={onClose} style={[styles.btn, { borderWidth: 2, borderColor: colors.rule }]}>
            <Text style={[styles.btnText, { color: colors.ink }]}>KEEP</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={[styles.btn, { backgroundColor: colors.accent }]}>
            <Text style={[styles.btnText, { color: colors.inverse }]}>DELETE</Text>
          </Pressable>
        </View>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18 },
  title: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 23 },
  body: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 8 },
  row: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.6 },
});
