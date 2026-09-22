import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip } from '../../components/Chip';
import { Dialog } from '../../components/Dialog';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Toggle } from '../../components/Toggle';
import { applyLinkFilter, linkHostname, type LinkFilterState } from '../../lib/linkFilters';
import { subCategoriesOf, topLevelCategories } from '../../mocks/categories';
import { tagCounts } from '../../mocks/links';
import { useAppSelector } from '../../store/hooks';
import { selectAllLinks } from '../../store/linksSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth } from '../../theme/tokens';
import { STATUS_SEQUENCE } from '../../types/models';

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This year', days: 365 },
  { label: 'All time', days: null },
] as const;

const SORT_OPTIONS: { value: NonNullable<LinkFilterState['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'lastOpened', label: 'Last opened' },
  { value: 'titleAsc', label: 'Title A–Z' },
];

// Design ref: Screen.dc.html — is.filters. The design shows this as a
// bottom sheet with a scrim over the screen underneath; here it's already
// a full-screen modal stack route (RootNavigator.tsx: presentation:
// 'modal'), so it's built as sheet-styled content (drag handle, header,
// footer) rather than re-wrapping in the BottomSheet component. "Source"
// has no schema field (PROJECT.md §3.3) — derived from unique hostnames
// present in the current dataset instead of inventing one, same as Link
// Detail's Source row.
export function FiltersScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const links = useAppSelector(selectAllLinks);

  const [topCategoryId, setTopCategoryId] = useState<string | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [status, setStatus] = useState<LinkFilterState['status']>(undefined);
  const [datePreset, setDatePreset] = useState<(typeof DATE_PRESETS)[number] | null>(null);
  const [source, setSource] = useState<string | undefined>(undefined);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<LinkFilterState['sort']>('newest');
  const [sortPickerVisible, setSortPickerVisible] = useState(false);

  const subOptions = useMemo(() => (topCategoryId ? subCategoriesOf(topCategoryId) : []), [topCategoryId]);
  const sourceOptions = useMemo(() => {
    const set = new Set(links.map((l) => linkHostname(l.url)));
    return [...set].sort();
  }, [links]);

  const categoryIds = useMemo(() => {
    if (subCategoryId) return [subCategoryId];
    if (topCategoryId) return subCategoriesOf(topCategoryId).map((s) => s.id);
    return undefined;
  }, [topCategoryId, subCategoryId]);

  const tagIds = useMemo(() => selectedTagNames.map((name) => `t-${name}`), [selectedTagNames]);

  const filter: LinkFilterState = useMemo(
    () => ({
      categoryIds,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      status,
      isFavorite: favoritesOnly || undefined,
      dateFrom: datePreset?.days ? new Date(Date.now() - datePreset.days * 86_400_000).toISOString() : undefined,
      source,
      sort,
    }),
    [categoryIds, tagIds, status, favoritesOnly, datePreset, source, sort]
  );

  const resultCount = useMemo(() => applyLinkFilter(links, filter).length, [links, filter]);

  function reset() {
    setTopCategoryId(null);
    setSubCategoryId(null);
    setSelectedTagNames([]);
    setStatus(undefined);
    setDatePreset(null);
    setSource(undefined);
    setFavoritesOnly(false);
    setSort('newest');
  }

  function commit() {
    navigation.navigate('Main', { screen: 'Search', params: { filters: filter } });
  }

  return (
    <ScreenContainer>
      <View style={styles.handleRow}>
        <View style={[styles.handle, { backgroundColor: colors.line }]} />
      </View>
      <View style={[styles.header, { borderBottomColor: colors.rule }]}>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Filter & sort</Text>
        <Pressable onPress={reset}>
          <Text style={[styles.resetAll, { color: colors.accent }]}>RESET ALL</Text>
        </Pressable>
      </View>

      <ScrollView>
        <FilterGroup label="Category">
          {topLevelCategories().map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              active={topCategoryId === c.id}
              onPress={() => {
                setTopCategoryId(topCategoryId === c.id ? null : c.id);
                setSubCategoryId(null);
              }}
            />
          ))}
        </FilterGroup>

        {topCategoryId ? (
          <FilterGroup label="Sub-category">
            {subOptions.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                active={subCategoryId === s.id}
                onPress={() => setSubCategoryId(subCategoryId === s.id ? null : s.id)}
              />
            ))}
          </FilterGroup>
        ) : null}

        <FilterGroup label="Tags">
          {tagCounts(links).slice(0, 10).map((t) => (
            <Chip
              key={t.name}
              label={`#${t.name}`}
              active={selectedTagNames.includes(t.name)}
              onPress={() =>
                setSelectedTagNames((prev) =>
                  prev.includes(t.name) ? prev.filter((n) => n !== t.name) : [...prev, t.name]
                )
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup label="Status">
          {STATUS_SEQUENCE.map((s) => (
            <Chip key={s} label={s} active={status === s} onPress={() => setStatus(status === s ? undefined : s)} />
          ))}
        </FilterGroup>

        <FilterGroup label="Date added">
          {DATE_PRESETS.map((p) => (
            <Chip
              key={p.label}
              label={p.label}
              active={datePreset?.label === p.label}
              onPress={() => setDatePreset(datePreset?.label === p.label ? null : p)}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="Source">
          {sourceOptions.map((s) => (
            <Chip key={s} label={s} active={source === s} onPress={() => setSource(source === s ? undefined : s)} />
          ))}
        </FilterGroup>

        <View style={[styles.toggleRow, { borderTopColor: colors.line }]}>
          <Text style={[styles.toggleLabel, { color: colors.ink }]}>Favorites only</Text>
          <Toggle value={favoritesOnly} onChange={setFavoritesOnly} />
        </View>

        <Pressable onPress={() => setSortPickerVisible(true)} style={[styles.sortRow, { borderTopColor: colors.line }]}>
          <Text style={[styles.toggleLabel, { color: colors.ink }]}>Sort</Text>
          <Text style={[styles.sortValue, { color: colors.muted }]}>
            {SORT_OPTIONS.find((o) => o.value === sort)?.label}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.rule }]}>
        <Pressable onPress={reset} style={[styles.resetBtn, { borderColor: colors.rule }]}>
          <Text style={[styles.resetBtnText, { color: colors.ink }]}>RESET</Text>
        </Pressable>
        <Pressable onPress={commit} style={[styles.showBtn, { backgroundColor: colors.accent }]}>
          <Text style={[styles.showBtnText, { color: colors.inverse }]}>
            SHOW {resultCount} {resultCount === 1 ? 'LINK' : 'LINKS'}
          </Text>
        </Pressable>
      </View>

      <Dialog visible={sortPickerVisible} onClose={() => setSortPickerVisible(false)} position="bottom">
        <View style={styles.sortDialog}>
          <Text style={[styles.sortDialogTitle, { color: colors.ink }]}>Sort by</Text>
          {SORT_OPTIONS.map((o, i) => (
            <Pressable
              key={o.value}
              onPress={() => {
                setSort(o.value);
                setSortPickerVisible(false);
              }}
              style={[styles.sortOption, i > 0 && { borderTopWidth: hairlineWidth, borderTopColor: colors.line }]}
            >
              <Text style={[styles.sortOptionText, { color: sort === o.value ? colors.accent : colors.ink }]}>
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Dialog>
    </ScreenContainer>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.group, { borderBottomColor: colors.line }]}>
      <Text style={[styles.groupLabel, { color: colors.muted }]}>{label}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  handleRow: { alignItems: 'center', paddingTop: 6 },
  handle: { width: 46, height: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, borderBottomWidth: ruleWidth },
  headerTitle: { fontFamily: fonts.heading, fontSize: 17 },
  resetAll: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.5 },
  group: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: hairlineWidth },
  groupLabel: { fontFamily: fonts.body, fontSize: 11.5, marginBottom: 9 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: hairlineWidth },
  toggleLabel: { fontFamily: fonts.body, fontSize: 14 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: hairlineWidth },
  sortValue: { fontFamily: fonts.body, fontSize: 13 },
  footer: { flexDirection: 'row', gap: 10, borderTopWidth: ruleWidth, padding: 20 },
  resetBtn: { width: 90, height: 50, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  resetBtnText: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 0.5 },
  showBtn: { flex: 1, height: 50, alignItems: 'center', justifyContent: 'center' },
  showBtnText: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.5 },
  sortDialog: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
  sortDialogTitle: { fontFamily: fonts.heading, fontSize: 16, marginBottom: 8 },
  sortOption: { paddingVertical: 13 },
  sortOptionText: { fontFamily: fonts.body, fontSize: 14.5 },
});
