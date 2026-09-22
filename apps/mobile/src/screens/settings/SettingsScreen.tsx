import { useNavigation, CommonActions } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useTheme, type AppearanceSetting } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth } from '../../theme/tokens';

const APPEARANCE_OPTIONS: readonly AppearanceSetting[] = ['light', 'dark', 'system'];

// Design ref: Screen.dc.html — is.settings ("You" tab). Import/export,
// backup & sync and biometric lock are shown for shell completeness but
// are V2/out-of-scope for v1 — kept non-functional (PROJECT.md §14.8,
// PLAN.md Phase 2). No real auth/user object exists yet (PLAN.md §1.1),
// so the profile row is placeholder data, same as HomeScreen's avatar.
export function SettingsScreen() {
  const { colors, setting, setSetting } = useTheme();
  const navigation = useNavigation<any>();

  const rows: { k: string; v: string }[] = [
    { k: 'Account & password', v: '' },
    { k: 'Default category', v: 'Other' },
    { k: 'Default status on save', v: 'Unread' },
    { k: 'Notifications', v: 'Weekly unread digest' },
    { k: 'Backup & sync', v: 'On · Wi-Fi only' },
    { k: 'Import bookmarks', v: 'HTML file' },
    { k: 'Export data', v: 'JSON · CSV' },
    { k: 'Security', v: 'Face ID lock' },
    { k: 'About', v: 'v1.0.0' },
  ];

  function logOut() {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'SignIn' }] }));
  }

  return (
    <ScreenContainer>
      <ScrollView>
        <View style={[styles.profileRow, { borderBottomColor: colors.rule }]}>
          <View style={[styles.avatar, { borderColor: colors.rule }]}>
            <Text style={[styles.avatarText, { color: colors.ink }]}>RT</Text>
          </View>
          <View style={styles.profileBody}>
            <Text style={[styles.name, { color: colors.ink }]}>Ravi Trivedi</Text>
            <Text style={[styles.email, { color: colors.muted }]}>ravi@example.com · local data only</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
        </View>

        <View style={styles.appearanceBlock}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>Appearance</Text>
          <SegmentedControl
            options={APPEARANCE_OPTIONS}
            value={setting}
            onChange={setSetting}
          />
        </View>

        {rows.map((r, i) => (
          // TODO: wire to real settings once apps/api + auth exist (PLAN.md §1.1, Phase 2).
          <Pressable
            key={r.k}
            style={[
              styles.row,
              i > 0 && { borderTopWidth: hairlineWidth, borderTopColor: colors.line },
            ]}
          >
            <Text style={[styles.rowKey, { color: colors.ink }]}>{r.k}</Text>
            {r.v ? <Text style={[styles.rowValue, { color: colors.muted }]}>{r.v}</Text> : null}
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.rule }]}>
        <Pressable onPress={logOut} style={[styles.logoutBtn, { borderColor: colors.accent }]}>
          <Text style={[styles.logoutText, { color: colors.accent }]}>LOG OUT</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: ruleWidth },
  avatar: { width: 46, height: 46, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, fontSize: 16 },
  profileBody: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.heading, fontSize: 19 },
  email: { fontFamily: fonts.body, fontSize: 12 },
  chevron: { fontSize: 14 },
  appearanceBlock: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  sectionLabel: { fontFamily: fonts.body, fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13 },
  rowKey: { fontFamily: fonts.body, fontSize: 14 },
  rowValue: { fontFamily: fonts.body, fontSize: 12.5 },
  footer: { padding: 20, borderTopWidth: ruleWidth },
  logoutBtn: { height: 50, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  logoutText: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.5 },
});
