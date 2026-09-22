import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { DeleteLinkDialog } from '../../components/DeleteLinkDialog';
import { domainInitial, LetterMark } from '../../components/LetterMark';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StatusPickerDialog } from '../../components/StatusPickerDialog';
import { linkHostname } from '../../lib/linkFilters';
import { categoryById } from '../../mocks/categories';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteLink, selectLinkById, setStatus } from '../../store/linksSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth } from '../../theme/tokens';

// Design ref: Screen.dc.html — is.detail. Open Link is the widest,
// reddest element on screen; metadata renders as a ruled label/value
// table; Status is tap-to-change here (consistent with the long-press
// fallback on the Saved/Status screen, PROJECT.md §14.9). "Source" in
// the design has no backing schema field (PROJECT.md §3.3 has no
// `source` column) — derived from the URL's hostname instead of
// inventing one.
export function LinkDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const linkId: string = route.params?.linkId;
  const link = useAppSelector(selectLinkById(linkId));

  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  if (!link) {
    return (
      <ScreenContainer style={styles.notFound}>
        <Text style={{ color: colors.muted, fontFamily: fonts.body }}>Link not found.</Text>
      </ScreenContainer>
    );
  }

  const category = link.categoryId ? categoryById(link.categoryId) : undefined;
  const parent = category?.parentId ? categoryById(category.parentId) : undefined;
  const categoryLabel = category ? (parent ? `${parent.name} › ${category.name}` : category.name) : 'Uncategorised';
  const tagsLabel = link.tags.length > 0 ? link.tags.map((t) => `#${t.name}`).join('  ') : 'No tags';

  const meta: { k: string; v: string }[] = [
    { k: 'Category', v: categoryLabel },
    { k: 'Tags', v: tagsLabel },
    { k: 'Status', v: `${link.status} — tap to change` },
    { k: 'Source', v: linkHostname(link.url) },
    { k: 'Added', v: formatDate(link.createdAt) },
    { k: 'Last opened', v: link.lastOpenedAt ? formatDate(link.lastOpenedAt) : 'Never' },
  ];

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.back, { color: colors.muted }]}>← LIBRARY</Text>
        </Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={() => navigation.navigate('EditLink', { linkId: link.id })}>
            <Text style={[styles.edit, { color: colors.accent }]}>EDIT</Text>
          </Pressable>
          <Pressable onPress={() => setDeleteVisible(true)}>
            <Text style={[styles.delete, { color: colors.muted }]}>DELETE</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.header, { borderBottomColor: colors.rule }]}>
        <View style={styles.identityRow}>
          <LetterMark letter={domainInitial(link.url)} size={40} />
          <View style={styles.identityBody}>
            <Text style={[styles.domain, { color: colors.muted }]}>{linkHostname(link.url)}</Text>
            <Text style={[styles.flags, { color: colors.accent }]}>
              {link.isFavorite ? 'FAVORITE · ' : ''}
              {link.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.ink }]}>{link.title}</Text>
        {link.description ? (
          <Text style={[styles.description, { color: colors.muted }]}>{link.description}</Text>
        ) : null}
        <Text style={[styles.url, { color: colors.muted }]}>{link.url}</Text>
      </View>

      {meta.map((m, i) => (
        <Pressable
          key={m.k}
          disabled={m.k !== 'Status'}
          onPress={() => setStatusPickerVisible(true)}
          style={[
            styles.metaRow,
            i > 0 && { borderTopWidth: hairlineWidth, borderTopColor: colors.line },
          ]}
        >
          <Text style={[styles.metaKey, { color: colors.muted }]}>{m.k.toUpperCase()}</Text>
          <Text style={[styles.metaValue, { color: colors.ink }]}>{m.v}</Text>
        </Pressable>
      ))}

      <View style={styles.notesBlock}>
        <Text style={[styles.notesLabel, { color: colors.muted }]}>NOTES</Text>
        <Text style={[styles.notesValue, { color: link.notes ? colors.ink : colors.muted }]}>
          {link.notes ?? 'No notes yet — add some from Edit.'}
        </Text>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.rule }]}>
        <Pressable
          onPress={() => Linking.openURL(link.url.includes('://') ? link.url : `https://${link.url}`)}
          style={[styles.openBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={[styles.openBtnText, { color: colors.inverse }]}>OPEN LINK</Text>
        </Pressable>
        <Pressable
          onPress={() => Share.share({ url: link.url, title: link.title, message: link.title })}
          style={[styles.shareBtn, { borderColor: colors.rule }]}
        >
          <Text style={[styles.shareBtnText, { color: colors.ink }]}>SHARE</Text>
        </Pressable>
      </View>

      <StatusPickerDialog
        visible={statusPickerVisible}
        current={link.status}
        onClose={() => setStatusPickerVisible(false)}
        onSelect={(s) => dispatch(setStatus({ id: link.id, status: s }))}
      />
      <DeleteLinkDialog
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
        onConfirm={() => {
          dispatch(deleteLink(link.id));
          navigation.navigate('Home');
        }}
      />
    </ScreenContainer>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const styles = StyleSheet.create({
  notFound: { alignItems: 'center', justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  back: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  topActions: { flexDirection: 'row', gap: 14 },
  edit: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  delete: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  header: { paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: ruleWidth },
  identityRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  identityBody: { gap: 4 },
  domain: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
  flags: { fontFamily: fonts.heading, fontSize: 10.5, letterSpacing: 0.8 },
  title: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 30 },
  description: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, marginTop: 10 },
  url: { fontFamily: fonts.body, fontSize: 12, marginTop: 10, textDecorationLine: 'underline' },
  metaRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, paddingVertical: 13, alignItems: 'flex-start' },
  metaKey: { width: 92, fontFamily: fonts.body, fontSize: 10, letterSpacing: 0.8 },
  metaValue: { flex: 1, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19 },
  notesBlock: { padding: 20 },
  notesLabel: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 0.8, marginBottom: 8 },
  notesValue: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19 },
  footer: { flexDirection: 'row', gap: 10, borderTopWidth: ruleWidth, padding: 20 },
  openBtn: { flex: 1, height: 54, alignItems: 'center', justifyContent: 'center' },
  openBtnText: { fontFamily: fonts.heading, fontSize: 13.5, letterSpacing: 0.5 },
  shareBtn: { width: 64, height: 54, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { fontFamily: fonts.heading, fontSize: 10.5, letterSpacing: 0.4 },
});
