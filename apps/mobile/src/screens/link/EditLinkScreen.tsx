import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CategoryPickerSheet } from '../../components/CategoryPickerSheet';
import { Chip } from '../../components/Chip';
import { DeleteLinkDialog } from '../../components/DeleteLinkDialog';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Toggle } from '../../components/Toggle';
import { tagCounts } from '../../mocks/links';
import { categoryById } from '../../mocks/categories';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteLink, selectAllLinks, selectLinkById, updateLink } from '../../store/linksSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth } from '../../theme/tokens';
import { STATUS_SEQUENCE, type Category, type LinkStatus } from '../../types/models';

// Design ref: Screen.dc.html — is.edit. Same field order as Add,
// prefilled; Delete opens the same DeleteLinkDialog used by Link Detail.
export function EditLinkScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const linkId: string = route.params?.linkId;
  const link = useAppSelector(selectLinkById(linkId));
  const links = useAppSelector(selectAllLinks);

  const [title, setTitle] = useState(link?.title ?? '');
  const [category, setCategory] = useState<Category | null>(
    link?.categoryId ? categoryById(link.categoryId) ?? null : null
  );
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [tags, setTags] = useState<string[]>(link?.tags.map((t) => t.name) ?? []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatusValue] = useState<LinkStatus>(link?.status ?? 'Unread');
  const [notes, setNotes] = useState(link?.notes ?? '');
  const [favorite, setFavorite] = useState(link?.isFavorite ?? false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  if (!link) {
    return (
      <ScreenContainer style={styles.notFound}>
        <Text style={{ color: colors.muted, fontFamily: fonts.body }}>Link not found.</Text>
      </ScreenContainer>
    );
  }

  function handleDone() {
    if (!link) return;
    dispatch(
      updateLink({
        ...link,
        title: title.trim() || link.title,
        categoryId: category?.id ?? null,
        tags: tags.map((name) => link.tags.find((t) => t.name === name) ?? { id: `t-${name}`, userId: 'u1', name }),
        status,
        notes: notes.trim() || null,
        isFavorite: favorite,
        updatedAt: new Date().toISOString(),
      })
    );
    navigation.navigate('LinkDetail', { linkId: link.id });
  }

  const categoryLabel = category
    ? category.parentId
      ? `${categoryById(category.parentId)?.name ?? ''} › ${category.name} ›`
      : `${category.name} ›`
    : 'Choose ›';

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.rule }]}>
        <Pressable onPress={() => navigation.navigate('LinkDetail', { linkId: link.id })}>
          <Text style={[styles.cancel, { color: colors.muted }]}>CANCEL</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>EDIT LINK</Text>
        <Pressable onPress={handleDone}>
          <Text style={[styles.done, { color: colors.accent }]}>DONE</Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { borderColor: colors.rule, color: colors.ink }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>URL</Text>
          <Text style={[styles.urlReadOnly, { borderColor: colors.line, color: colors.muted }]}>{link.url}</Text>
        </View>

        <Pressable
          onPress={() => setCategoryPickerVisible(true)}
          style={[styles.field, styles.fieldRow, { borderBottomColor: colors.line }]}
        >
          <Text style={[styles.fieldLabel, { color: colors.muted, marginBottom: 0 }]}>Category</Text>
          <Text style={[styles.fieldValue, { color: category ? colors.accent : colors.muted }]}>{categoryLabel}</Text>
        </Pressable>

        <View style={[styles.field, { borderBottomColor: colors.line, borderBottomWidth: hairlineWidth }]}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Tags</Text>
          <View style={styles.chipWrap}>
            {tags.map((t) => (
              <Chip key={t} label={`${t} ×`} active onPress={() => setTags((prev) => prev.filter((x) => x !== t))} />
            ))}
            {tagCounts(links)
              .filter((t) => !tags.includes(t.name))
              .slice(0, 4)
              .map((t) => (
                <Chip key={t.name} label={t.name} variant="outline" onPress={() => setTags((prev) => [...prev, t.name])} />
              ))}
          </View>
          <View style={styles.tagInputRow}>
            <TextInput
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="+ add"
              placeholderTextColor={colors.muted}
              onSubmitEditing={() => {
                const name = tagInput.trim();
                if (name && !tags.includes(name)) setTags((prev) => [...prev, name]);
                setTagInput('');
              }}
              style={[styles.tagInput, { borderColor: colors.line, color: colors.ink }]}
            />
          </View>
        </View>

        <View style={[styles.field, { borderBottomColor: colors.line, borderBottomWidth: hairlineWidth }]}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
            {STATUS_SEQUENCE.map((s) => (
              <Chip key={s} label={s} active={status === s} onPress={() => setStatusValue(s)} />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.field, { borderBottomColor: colors.line, borderBottomWidth: hairlineWidth }]}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Why am I saving this?"
            placeholderTextColor={colors.muted}
            multiline
            style={[styles.notesInput, { color: colors.ink }]}
          />
        </View>

        <View style={[styles.field, styles.fieldRow]}>
          <Text style={[styles.fieldLabel, { color: colors.ink, marginBottom: 0 }]}>Favorite</Text>
          <Toggle value={favorite} onChange={setFavorite} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.rule }]}>
        <Pressable onPress={handleDone} style={[styles.saveBtn, { backgroundColor: colors.accent }]}>
          <Text style={[styles.saveBtnText, { color: colors.inverse }]}>SAVE CHANGES</Text>
        </Pressable>
        <Pressable onPress={() => setDeleteVisible(true)} style={[styles.deleteBtn, { borderColor: colors.accent }]}>
          <Text style={[styles.deleteBtnText, { color: colors.accent }]}>DELETE</Text>
        </Pressable>
      </View>

      <CategoryPickerSheet
        visible={categoryPickerVisible}
        onClose={() => setCategoryPickerVisible(false)}
        onSelect={setCategory}
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

const styles = StyleSheet.create({
  notFound: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, borderBottomWidth: ruleWidth },
  cancel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  headerTitle: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.8 },
  done: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 0.8 },
  field: { paddingHorizontal: 20, paddingVertical: 14 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: hairlineWidth },
  fieldLabel: { fontFamily: fonts.body, fontSize: 12.5, letterSpacing: 0.4, marginBottom: 8 },
  fieldValue: { fontFamily: fonts.body, fontSize: 13.5 },
  titleInput: { borderWidth: 2, padding: 12, fontFamily: fonts.body, fontSize: 14 },
  urlReadOnly: { borderWidth: 1, padding: 12, fontFamily: fonts.body, fontSize: 13 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagInputRow: { marginTop: 10 },
  tagInput: { borderWidth: 1, borderStyle: 'dashed', padding: 10, fontFamily: fonts.body, fontSize: 12.5 },
  statusRow: { gap: 8 },
  notesInput: { fontFamily: fonts.body, fontSize: 13.5, minHeight: 44, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', gap: 10, borderTopWidth: ruleWidth, padding: 20 },
  saveBtn: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.5 },
  deleteBtn: { width: 74, height: 52, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontFamily: fonts.heading, fontSize: 11.5, letterSpacing: 0.4 },
});
