import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CategoryPickerSheet } from '../../components/CategoryPickerSheet';
import { Chip } from '../../components/Chip';
import { Dialog } from '../../components/Dialog';
import { LinkRow } from '../../components/LinkRow';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Toggle } from '../../components/Toggle';
import { guessTitleFromUrl, isValidUrl, normalizeUrl, suggestUrlFix } from '../../lib/urlNormalize';
import { categoryById } from '../../mocks/categories';
import { tagCounts } from '../../mocks/links';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addLink, selectAllLinks } from '../../store/linksSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth, type } from '../../theme/tokens';
import { STATUS_SEQUENCE, type Category, type Link, type LinkStatus } from '../../types/models';

// Suggested-category pair shown on the Share-to-app sheet — mirrors the
// exact sample pairing in Screen.dc.html (is.share): a dev sub-category
// and a learning/video one, both of which exist in the seeded taxonomy.
const SHARE_SUGGESTED_CATEGORY_IDS = ['c-dev-react', 'c-learning-youtube'];

type Stage = 'idle' | 'loading' | 'metaFail' | 'invalidUrl';

// Design ref: Screen.dc.html — is.add / is.addLoading / is.metaFail /
// is.invalidUrl / is.duplicate / is.share are states of this one flow.
// Metadata fetching is simulated (setTimeout) — there's no apps/metadata
// service yet (that's V2, PROJECT.md §7.1/§11); the states themselves
// (loading/fail/success) are built for real so the UI is ready to swap in
// a real fetch later. `is.share` renders when `sharedUrl` is present,
// standing in for what a native share-extension hand-off would look like
// until the OS-level wiring in PLAN.md §1.6 exists.
export function AddLinkScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const links = useAppSelector(selectAllLinks);

  const sharedUrl: string | undefined = route.params?.sharedUrl;
  const [shareMode, setShareMode] = useState(!!sharedUrl);

  const [url, setUrl] = useState(sharedUrl ?? '');
  const [stage, setStage] = useState<Stage>('idle');
  const [detected, setDetected] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<LinkStatus>('Unread');
  const [notes, setNotes] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [duplicateLink, setDuplicateLink] = useState<Link | null>(null);

  // Share-sheet suggestion state.
  const shareCategoryOptions = useMemo(
    () => SHARE_SUGGESTED_CATEGORY_IDS.map((id) => categoryById(id)).filter((c): c is Category => !!c),
    []
  );
  const shareTagOptions = useMemo(() => tagCounts(links).slice(0, 2).map((t) => t.name), [links]);
  const [shareCategoryId, setShareCategoryId] = useState<string | undefined>(shareCategoryOptions[0]?.id);
  const [shareTags, setShareTags] = useState<Set<string>>(new Set(shareTagOptions));

  const normalized = useMemo(() => normalizeUrl(url), [url]);

  // Simulated metadata fetch — non-blocking (the rest of the form stays
  // editable while `stage === 'loading'`).
  useEffect(() => {
    if (shareMode) return; // share sheet has its own fixed "detected" content
    const trimmed = url.trim();
    if (!trimmed) {
      setStage('idle');
      setDetected(false);
      return;
    }
    if (!isValidUrl(trimmed)) {
      setStage('invalidUrl');
      setDetected(false);
      return;
    }
    setStage('loading');
    setDetected(false);
    const t = setTimeout(() => {
      if (trimmed.toLowerCase().includes('fail')) {
        setStage('metaFail');
      } else {
        setTitle(guessTitleFromUrl(trimmed));
        setDescription(null);
        setDetected(true);
        setStage('idle');
      }
    }, 900);
    return () => clearTimeout(t);
  }, [url, shareMode]);

  function commitSave(overrideCategory?: Category | null, overrideTags?: string[]) {
    const finalCategory = overrideCategory !== undefined ? overrideCategory : category;
    const finalTags = overrideTags ?? tags;
    const finalTitle = title.trim() || guessTitleFromUrl(url);
    const newLink: Link = {
      id: `l-${Date.now()}`,
      userId: 'u1',
      title: finalTitle,
      url: url.trim(),
      description,
      favicon: null,
      previewImage: null,
      categoryId: finalCategory?.id ?? null,
      tags: finalTags.map((name) => ({ id: `t-${name}`, userId: 'u1', name })),
      status,
      isFavorite: favorite,
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: null,
    };
    dispatch(addLink(newLink));
    navigation.navigate('Main', {
      screen: 'Home',
      params: { justSaved: { title: finalTitle, category: finalCategory?.name ?? 'Other' } },
    });
  }

  function findDuplicate(): Link | null {
    return links.find((l) => normalizeUrl(l.url).normalized === normalized.normalized) ?? null;
  }

  function handleSavePress() {
    if (!url.trim() || stage === 'invalidUrl') return;
    const dup = findDuplicate();
    if (dup) {
      setDuplicateLink(dup);
      return;
    }
    commitSave();
  }

  // Share-sheet: a second tap on an already-selected suggestion chip
  // saves immediately (PROJECT.md §14.9's double-tap-to-save shortcut),
  // alongside — not instead of — the explicit SAVE — ONE TAP button.
  function tapShareCategory(cat: Category) {
    if (shareCategoryId === cat.id) {
      shareSave();
    } else {
      setShareCategoryId(cat.id);
    }
  }
  function tapShareTag(name: string) {
    if (shareTags.has(name)) {
      shareSave();
    } else {
      setShareTags((prev) => new Set(prev).add(name));
    }
  }
  function shareSave() {
    const dup = findDuplicate();
    const cat = shareCategoryOptions.find((c) => c.id === shareCategoryId) ?? null;
    if (dup) {
      setDuplicateLink(dup);
      return;
    }
    setTitle(guessTitleFromUrl(url));
    commitSave(cat, [...shareTags]);
  }

  if (shareMode) {
    return (
      <ScreenContainer style={{ backgroundColor: '#0d0c0c' }}>
        <View style={styles.hostBackdrop}>
          <Text style={styles.hostLabel}>YOUTUBE</Text>
          <View style={styles.hostPlayer}>
            <Text style={styles.hostPlayerText}>VIDEO PLAYER</Text>
          </View>
        </View>
        <View style={styles.scrim} />
        <View style={[styles.shareSheet, { backgroundColor: colors.bg, borderTopColor: colors.accent }]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: colors.line }]} />
          </View>
          <View style={styles.shareHeader}>
            <Text style={[styles.shareTitle, { color: colors.ink }]}>SAVE TO LINKVAULT</Text>
            <Pressable onPress={() => navigation.navigate('Home')}>
              <Text style={[styles.shareClose, { color: colors.muted }]}>CLOSE</Text>
            </Pressable>
          </View>

          <View style={styles.shareDetected}>
            <View style={[styles.sharePreview, { borderColor: colors.rule }]}>
              <Text style={[styles.sharePreviewText, { color: colors.muted }]}>PREVIEW</Text>
            </View>
            <View style={styles.shareDetectedBody}>
              <Text style={[styles.shareDetectedTitle, { color: colors.ink }]} numberOfLines={2}>
                {guessTitleFromUrl(url)}
              </Text>
              <Text style={[styles.shareDetectedMeta, { color: colors.muted }]}>
                {normalized.normalized.split('/')[0]} · detected automatically
              </Text>
            </View>
          </View>

          <View style={[styles.shareGroup, { borderBottomColor: colors.line }]}>
            <Text style={[styles.shareGroupLabel, { color: colors.muted }]}>Suggested category</Text>
            <View style={styles.shareChipRow}>
              {shareCategoryOptions.map((c) => {
                const parent = c.parentId ? categoryById(c.parentId) : null;
                return (
                  <Chip
                    key={c.id}
                    label={parent ? `${parent.name} › ${c.name}` : c.name}
                    active={shareCategoryId === c.id}
                    onPress={() => tapShareCategory(c)}
                  />
                );
              })}
            </View>
          </View>

          <View style={[styles.shareGroup, { borderBottomColor: colors.line }]}>
            <Text style={[styles.shareGroupLabel, { color: colors.muted }]}>Suggested tags</Text>
            <View style={styles.shareChipRow}>
              {shareTagOptions.map((name) => (
                <Chip key={name} label={name} active={shareTags.has(name)} onPress={() => tapShareTag(name)} />
              ))}
              <Chip label="+ video" variant="outline" onPress={() => {}} />
            </View>
          </View>

          <View style={styles.shareFooter}>
            <Pressable
              onPress={() => setShareMode(false)}
              style={[styles.shareMore, { borderColor: colors.rule }]}
            >
              <Text style={[styles.shareMoreText, { color: colors.ink }]}>MORE</Text>
            </Pressable>
            <Pressable onPress={shareSave} style={[styles.shareSaveBtn, { backgroundColor: colors.accent }]}>
              <Text style={[styles.shareSaveText, { color: colors.inverse }]}>SAVE — ONE TAP</Text>
            </Pressable>
          </View>
        </View>

        {duplicateLink ? (
          <DuplicateDialog
            link={duplicateLink}
            onOpenExisting={() => navigation.navigate('LinkDetail', { linkId: duplicateLink.id })}
            onSaveAnyway={() => {
              setDuplicateLink(null);
              shareSave();
            }}
            onCancel={() => setDuplicateLink(null)}
          />
        ) : null}
      </ScreenContainer>
    );
  }

  const categoryLabel = category
    ? category.parentId
      ? `${categoryById(category.parentId)?.name ?? ''} › ${category.name} ›`
      : `${category.name} ›`
    : 'Choose ›';
  const saveLabel =
    stage === 'metaFail' ? 'SAVE ANYWAY' : category ? `SAVE TO ${categoryLabel.replace(' ›', '').toUpperCase()}` : 'SAVE';
  const saveDisabled = !url.trim() || stage === 'invalidUrl';

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.rule }]}>
        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.cancel, { color: colors.muted }]}>CANCEL</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>SAVE LINK</Text>
        <Pressable onPress={handleSavePress} disabled={saveDisabled}>
          <Text style={[styles.save, { color: saveDisabled ? colors.muted : colors.accent }]}>SAVE</Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.urlBlock}>
          <Text style={[styles.label, { color: colors.accent }]}>URL — REQUIRED</Text>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="Paste or type a link"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.urlInput, { borderColor: colors.accent, color: colors.ink }]}
          />
          {stage === 'idle' && normalized.strippedCount > 0 ? (
            <View style={styles.badgeRow}>
              <Text style={[styles.badge, { borderColor: colors.line, color: colors.muted }]}>
                Normalised · {normalized.strippedCount} {normalized.strippedCount === 1 ? 'param' : 'params'} stripped
              </Text>
            </View>
          ) : null}
        </View>

        {stage === 'invalidUrl' ? <InvalidUrlHint url={url} onUseSuggestion={setUrl} /> : null}
        {stage === 'loading' ? <LoadingCard /> : null}
        {stage === 'metaFail' ? <MetaFailCard onRetry={() => setUrl((u) => u.trim())} /> : null}
        {stage === 'idle' && detected ? (
          <View style={[styles.previewCard, { borderColor: colors.rule }]}>
            <View style={[styles.previewImg, { borderColor: colors.rule }]}>
              <Text style={[styles.previewImgText, { color: colors.muted }]}>OG IMAGE</Text>
            </View>
            <View style={styles.previewBody}>
              <Text style={[styles.previewTitle, { color: colors.ink }]} numberOfLines={2}>
                {title}
              </Text>
              <Text style={[styles.previewHelper, { color: colors.muted }]}>
                Title, description and preview detected automatically
              </Text>
            </View>
          </View>
        ) : null}

        {stage === 'metaFail' ? (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.accent }]}>TITLE — REQUIRED NOW</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Give it a title"
              placeholderTextColor={colors.muted}
              style={[styles.titleInput, { borderColor: colors.accent, color: colors.ink }]}
            />
          </View>
        ) : null}

        <Pressable
          onPress={() => setCategoryPickerVisible(true)}
          style={[styles.field, styles.fieldRow, { borderBottomColor: colors.line }]}
        >
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Category</Text>
          <Text style={[styles.fieldValue, { color: category ? colors.accent : colors.muted }]}>{categoryLabel}</Text>
        </Pressable>

        <View style={[styles.field, { borderBottomColor: colors.line, borderBottomWidth: hairlineWidth }]}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Tags — optional</Text>
          <View style={styles.chipWrap}>
            {tags.map((t) => (
              <Chip
                key={t}
                label={`${t} ×`}
                active
                onPress={() => setTags((prev) => prev.filter((x) => x !== t))}
              />
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
              placeholder="+ add tag"
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
              <Chip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.field, { borderBottomColor: colors.line, borderBottomWidth: hairlineWidth }]}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>Notes — optional</Text>
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
          <Text style={[styles.fieldLabel, { color: colors.ink }]}>Mark as favorite</Text>
          <Toggle value={favorite} onChange={setFavorite} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.rule }]}>
        <Pressable
          onPress={handleSavePress}
          disabled={saveDisabled}
          style={[styles.saveBtn, { backgroundColor: saveDisabled ? colors.line : colors.accent }]}
        >
          <Text style={[styles.saveBtnText, { color: colors.inverse }]}>{saveLabel}</Text>
        </Pressable>
      </View>

      <CategoryPickerSheet
        visible={categoryPickerVisible}
        onClose={() => setCategoryPickerVisible(false)}
        onSelect={setCategory}
      />

      {duplicateLink ? (
        <DuplicateDialog
          link={duplicateLink}
          onOpenExisting={() => navigation.navigate('LinkDetail', { linkId: duplicateLink.id })}
          onSaveAnyway={() => {
            setDuplicateLink(null);
            commitSave();
          }}
          onCancel={() => {
            setDuplicateLink(null);
            navigation.navigate('Home');
          }}
        />
      ) : null}
    </ScreenContainer>
  );
}

function InvalidUrlHint({ url, onUseSuggestion }: { url: string; onUseSuggestion: (url: string) => void }) {
  const { colors } = useTheme();
  const suggestion = suggestUrlFix(url);
  return (
    <View style={styles.hintBlock}>
      <View style={styles.hintRow}>
        <View style={[styles.hintDot, { backgroundColor: colors.accent }]} />
        <Text style={[styles.hintText, { color: colors.accent }]}>
          That isn't a valid URL.{suggestion ? ' Check the scheme — did you mean ' : ''}
          {suggestion ? <Text style={styles.hintUnderline}>{suggestion}</Text> : null}
          {suggestion ? '?' : ' Check the scheme and try again.'}
        </Text>
      </View>
      {suggestion ? (
        <Pressable onPress={() => onUseSuggestion(suggestion)} style={[styles.hintBtn, { borderColor: colors.rule }]}>
          <Text style={[styles.hintBtnText, { color: colors.ink }]}>USE SUGGESTION</Text>
        </Pressable>
      ) : null}
      <Text style={[styles.hintFooter, { color: colors.muted }]}>
        Nothing else is required yet. Category, tags, status and notes stay optional until the URL is valid.
      </Text>
    </View>
  );
}

function LoadingCard() {
  const { colors } = useTheme();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.loadingCard, { borderColor: colors.rule }]}>
      <View style={styles.loadingHeader}>
        <Animated.View style={[styles.spinner, { borderColor: colors.rule, transform: [{ rotate }] }]} />
        <Text style={[styles.loadingTitle, { color: colors.ink }]}>READING THE PAGE…</Text>
      </View>
      <View style={styles.loadingLines}>
        <View style={[styles.loadingLine, { width: '85%', backgroundColor: colors.line }]} />
        <View style={[styles.loadingLine, { width: '55%', backgroundColor: colors.line }]} />
        <View style={[styles.loadingLine, { width: '70%', backgroundColor: colors.line }]} />
      </View>
      <Text style={[styles.loadingHelper, { color: colors.muted }]}>
        Fetching title, description, favicon and preview image. You can keep filling the rest in.
      </Text>
    </View>
  );
}

function MetaFailCard({ onRetry }: { onRetry: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.failCard, { borderColor: colors.accent }]}>
      <Text style={[styles.failTitle, { color: colors.accent }]}>COULDN'T READ THIS PAGE</Text>
      <Text style={[styles.failBody, { color: colors.muted }]}>
        The site blocked the request, so there's no title or preview. Type a title and it saves normally.
      </Text>
      <Pressable onPress={onRetry} style={[styles.failBtn, { borderColor: colors.rule }]}>
        <Text style={[styles.failBtnText, { color: colors.ink }]}>RETRY FETCH</Text>
      </Pressable>
    </View>
  );
}

function DuplicateDialog({
  link,
  onOpenExisting,
  onSaveAnyway,
  onCancel,
}: {
  link: Link;
  onOpenExisting: () => void;
  onSaveAnyway: () => void;
  onCancel: () => void;
}) {
  const { colors } = useTheme();
  const category = link.categoryId ? categoryById(link.categoryId) : undefined;
  const parent = category?.parentId ? categoryById(category.parentId) : undefined;
  return (
    <Dialog visible onClose={onCancel} position="center">
      <View style={[styles.dupTitleBar, { backgroundColor: colors.accent }]}>
        <Text style={[styles.dupTitleText, { color: colors.inverse }]}>ALREADY IN YOUR VAULT</Text>
      </View>
      <View style={styles.dupBody}>
        <Text style={[styles.dupExplain, { color: colors.muted }]}>
          You already saved this. Same URL after stripping tracking parameters.
        </Text>
        <View style={[styles.dupRow, { borderColor: colors.line }]}>
          <LinkRow link={link} compact />
        </View>
        {parent && category ? (
          <Text style={[styles.dupMeta, { color: colors.muted }]}>
            {parent.name} · {category.name} · {link.status}
          </Text>
        ) : null}
        <View style={styles.dupActions}>
          <Pressable onPress={onOpenExisting} style={[styles.dupBtn, { backgroundColor: colors.accent }]}>
            <Text style={[styles.dupBtnText, { color: colors.inverse }]}>OPEN THE EXISTING LINK</Text>
          </Pressable>
          <Pressable onPress={onSaveAnyway} style={[styles.dupBtn, { borderWidth: 2, borderColor: colors.rule }]}>
            <Text style={[styles.dupBtnText, { color: colors.ink }]}>SAVE A SECOND COPY</Text>
          </Pressable>
          <Pressable onPress={onCancel} style={styles.dupCancel}>
            <Text style={[styles.dupCancelText, { color: colors.muted }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, borderBottomWidth: ruleWidth },
  cancel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  headerTitle: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.8 },
  save: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 0.8 },
  urlBlock: { padding: 20 },
  label: { fontFamily: fonts.heading, fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  urlInput: { borderWidth: 2, padding: 14, fontFamily: fonts.body, fontSize: 14 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: { borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5, fontFamily: fonts.body, fontSize: 10.5 },
  hintBlock: { paddingHorizontal: 20, paddingBottom: 16 },
  hintRow: { flexDirection: 'row', gap: 9 },
  hintDot: { width: 9, height: 9, marginTop: 4 },
  hintText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18 },
  hintUnderline: { textDecorationLine: 'underline' },
  hintBtn: { marginTop: 12, height: 42, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  hintBtnText: { fontFamily: fonts.heading, fontSize: 11.5, letterSpacing: 0.6 },
  hintFooter: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17, marginTop: 12 },
  loadingCard: { marginHorizontal: 20, marginBottom: 16, borderWidth: ruleWidth, padding: 16 },
  loadingHeader: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  spinner: { width: 14, height: 14, borderWidth: 2, borderTopColor: 'transparent' },
  loadingTitle: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 1 },
  loadingLines: { gap: 9, marginTop: 16 },
  loadingLine: { height: 10 },
  loadingHelper: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 14 },
  failCard: { marginHorizontal: 20, marginBottom: 16, borderWidth: ruleWidth, padding: 16 },
  failTitle: { fontFamily: fonts.heading, fontSize: 12.5, letterSpacing: 0.4 },
  failBody: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, marginTop: 8 },
  failBtn: { marginTop: 12, height: 42, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  failBtnText: { fontFamily: fonts.heading, fontSize: 11.5, letterSpacing: 0.6 },
  previewCard: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 16, borderWidth: ruleWidth, padding: 14, alignItems: 'center' },
  previewImg: { width: 56, height: 40, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  previewImgText: { fontFamily: fonts.body, fontSize: 8, letterSpacing: 0.4 },
  previewBody: { flex: 1, gap: 4 },
  previewTitle: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 18 },
  previewHelper: { fontFamily: fonts.body, fontSize: 11, lineHeight: 15 },
  field: { paddingHorizontal: 20, paddingVertical: 14 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: hairlineWidth },
  fieldLabel: { fontFamily: fonts.body, fontSize: 12.5, letterSpacing: 0.4, marginBottom: 8 },
  fieldValue: { fontFamily: fonts.body, fontSize: 13.5 },
  titleInput: { borderWidth: 2, padding: 12, fontFamily: fonts.body, fontSize: 14 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagInputRow: { marginTop: 10 },
  tagInput: { borderWidth: 1, borderStyle: 'dashed', padding: 10, fontFamily: fonts.body, fontSize: 12.5 },
  statusRow: { gap: 8 },
  notesInput: { fontFamily: fonts.body, fontSize: 13.5, minHeight: 44, textAlignVertical: 'top' },
  footer: { borderTopWidth: ruleWidth, padding: 20 },
  saveBtn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.5 },
  // Share sheet
  hostBackdrop: { padding: 20, gap: 14 },
  hostLabel: { color: '#8a8886', fontFamily: fonts.heading, fontSize: 11, letterSpacing: 1.4 },
  hostPlayer: { height: 200, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  hostPlayerText: { color: '#666', fontFamily: fonts.body, fontSize: 11 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,10,0.6)' },
  shareSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: ruleWidth },
  handleRow: { alignItems: 'center', paddingTop: 10 },
  handle: { width: 46, height: 3 },
  shareHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  shareTitle: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.6 },
  shareClose: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.6 },
  shareDetected: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 14, alignItems: 'center' },
  sharePreview: { width: 64, height: 46, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  sharePreviewText: { fontFamily: fonts.body, fontSize: 8, letterSpacing: 0.4 },
  shareDetectedBody: { flex: 1, gap: 4 },
  shareDetectedTitle: { fontFamily: fonts.heading, fontSize: 14 },
  shareDetectedMeta: { fontFamily: fonts.body, fontSize: 11 },
  shareGroup: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: hairlineWidth },
  shareGroupLabel: { fontFamily: fonts.body, fontSize: 11.5, marginBottom: 9 },
  shareChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  shareFooter: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 },
  shareMore: { width: 58, height: 52, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  shareMoreText: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.4 },
  shareSaveBtn: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' },
  shareSaveText: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.5 },
  // Duplicate dialog
  dupTitleBar: { padding: 14 },
  dupTitleText: { fontFamily: fonts.heading, fontSize: 12.5, letterSpacing: 0.6 },
  dupBody: { padding: 16 },
  dupExplain: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18 },
  dupRow: { marginTop: 12, borderWidth: 1 },
  dupMeta: { fontFamily: fonts.body, fontSize: 11.5, marginTop: 8 },
  dupActions: { gap: 9, marginTop: 16 },
  dupBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  dupBtnText: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 0.5 },
  dupCancel: { height: 40, alignItems: 'center', justifyContent: 'center' },
  dupCancelText: { fontFamily: fonts.body, fontSize: 12.5 },
});
