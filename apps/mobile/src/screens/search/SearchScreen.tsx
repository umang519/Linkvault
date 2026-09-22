import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip } from '../../components/Chip';
import { LinkRow } from '../../components/LinkRow';
import { ScreenContainer } from '../../components/ScreenContainer';
import { applyLinkFilter, activeFilterCount, type LinkFilterState } from '../../lib/linkFilters';
import { tagCounts } from '../../mocks/links';
import { useAppSelector } from '../../store/hooks';
import { selectAllLinks } from '../../store/linksSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth, type } from '../../theme/tokens';

// Design ref: Screen.dc.html — is.searchIdle / is.search / is.noResults are
// states of this one route (idle → typing → results / zero-results), per
// RootNavigator.tsx. Filters against the `links` Redux slice client-side
// for now — swap the `applyLinkFilter` call for a `useSearchLinksQuery()`
// RTK Query call once apps/api exists (PLAN.md §1.4); the field list this
// searches (title/url/description/notes/tags) must match PROJECT.md §5.1
// either way. `filters` (structured criteria from the Filters screen) and
// the free-text query AND together, per PROJECT.md §5.2.
const RECENT_SEARCHES = [
  { q: 'react performance', n: 7 },
  { q: 'unread aws', n: 4 },
  { q: 'ipo gmp', n: 3 },
  { q: 'mutual funds tax', n: 5 },
];

export function SearchScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const links = useAppSelector(selectAllLinks);
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [filters, setFilters] = useState<LinkFilterState>(route.params?.filters ?? {});

  // Tab screens stay mounted across switches, so a fresh initialQuery/
  // filters (e.g. tapping a tag in Browse, or committing the Filters
  // sheet) needs an effect, not just useState's one-time initializer, to
  // actually update an already-mounted screen.
  useEffect(() => {
    if (route.params?.initialQuery) setQuery(route.params.initialQuery);
  }, [route.params?.initialQuery]);
  useEffect(() => {
    if (route.params?.filters) setFilters(route.params.filters);
  }, [route.params?.filters]);

  const filterCount = activeFilterCount(filters);
  const isIdle = query.trim().length === 0 && filterCount === 0;
  const results = useMemo(
    () => (isIdle ? [] : applyLinkFilter(links, { ...filters, search: query })),
    [links, query, filters, isIdle]
  );
  const isNoResults = !isIdle && results.length === 0;
  const topTags = useMemo(() => tagCounts(links).slice(0, 8), [links]);

  return (
    <ScreenContainer>
      <View style={styles.searchRow}>
        <View style={[styles.field, { borderColor: colors.accent }]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${links.length} links`}
            placeholderTextColor={colors.muted}
            autoFocus
            style={[styles.input, { color: colors.ink }]}
          />
        </View>
        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.cancel, { color: colors.ink }]}>CANCEL</Text>
        </Pressable>
      </View>

      {isIdle ? (
        <IdleState
          topTags={topTags}
          onPick={setQuery}
        />
      ) : isNoResults ? (
        <NoResults
          query={query}
          onSaveInstead={() => navigation.navigate('AddLink')}
          onClearFilters={filterCount > 0 ? () => setFilters({}) : undefined}
        />
      ) : (
        <>
          <View style={[styles.resultsHeader, { borderTopColor: colors.rule, borderTopWidth: ruleWidth, borderBottomColor: colors.line, borderBottomWidth: hairlineWidth }]}>
            <Text style={[styles.resultsCount, { color: colors.muted }]}>
              {results.length} {results.length === 1 ? 'link' : 'links'} · title, url, notes, tags
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Filters')}
              style={[styles.filterBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.filterBtnText, { color: colors.inverse }]}>
                FILTER{filterCount > 0 ? ` (${filterCount})` : ''}
              </Text>
            </Pressable>
          </View>
          <FlatList
            data={results}
            keyExtractor={(l) => l.id}
            renderItem={({ item }) => (
              <LinkRow link={item} onOpen={() => navigation.navigate('LinkDetail', { linkId: item.id })} />
            )}
          />
        </>
      )}
    </ScreenContainer>
  );
}

function IdleState({
  topTags,
  onPick,
}: {
  topTags: { name: string; n: number }[];
  onPick: (q: string) => void;
}) {
  const { colors } = useTheme();
  const [recent, setRecent] = useState(RECENT_SEARCHES);

  return (
    <View style={styles.idle}>
      <View style={[styles.sectionHeader, { borderTopColor: colors.rule, borderTopWidth: ruleWidth }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>RECENT SEARCHES</Text>
        <Pressable onPress={() => setRecent([])}>
          <Text style={[styles.clear, { color: colors.accent }]}>CLEAR</Text>
        </Pressable>
      </View>
      {recent.map((r) => (
        <Pressable
          key={r.q}
          onPress={() => onPick(r.q)}
          style={[styles.recentRow, { borderBottomColor: colors.line }]}
        >
          <Text style={[styles.recentQuery, { color: colors.ink }]}>{r.q}</Text>
          <Text style={[styles.recentCount, { color: colors.muted }]}>{r.n} links</Text>
        </Pressable>
      ))}

      <Text style={[styles.sectionTitle, styles.tagsTitle, { color: colors.ink }]}>SEARCH BY TAG</Text>
      <View style={styles.tagWrap}>
        {topTags.map((t) => (
          <Chip key={t.name} label={`#${t.name} ${t.n}`} onPress={() => onPick(t.name)} />
        ))}
      </View>
    </View>
  );
}

function NoResults({
  query,
  onSaveInstead,
  onClearFilters,
}: {
  query: string;
  onSaveInstead: () => void;
  onClearFilters?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.noResults, { borderTopColor: colors.rule, borderTopWidth: ruleWidth }]}>
      <Text style={[styles.noResultsTitle, { color: colors.ink }]}>
        {query.trim() ? `No links match "${query}".` : 'No links match these filters.'}
      </Text>
      <Text style={[styles.noResultsBody, { color: colors.muted }]}>
        Searched titles, URLs, descriptions, notes and tags.
      </Text>
      {onClearFilters ? (
        <Pressable onPress={onClearFilters} style={styles.clearFiltersLink}>
          <Text style={[styles.clearFiltersText, { color: colors.accent }]}>CLEAR ACTIVE FILTERS</Text>
        </Pressable>
      ) : null}
      <Pressable style={[styles.noResultsButton, { backgroundColor: colors.accent }]} onPress={onSaveInstead}>
        <Text style={[styles.noResultsButtonText, { color: colors.inverse }]}>
          SAVE A LINK FOR THIS INSTEAD
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  field: { flex: 1, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 13 },
  input: { fontFamily: fonts.body, fontSize: 15, padding: 0 },
  cancel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  idle: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 1.4 },
  clear: { fontFamily: fonts.body, fontSize: 11 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: hairlineWidth },
  recentQuery: { fontFamily: fonts.body, fontSize: 14.5 },
  recentCount: { fontFamily: fonts.body, fontSize: 11 },
  tagsTitle: { paddingTop: 22, paddingBottom: 10 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 11 },
  resultsCount: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  filterBtnText: { fontFamily: fonts.heading, fontSize: 10, letterSpacing: 0.6 },
  noResults: { padding: 20 },
  noResultsTitle: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 26 },
  noResultsBody: { fontFamily: fonts.body, fontSize: type.body, lineHeight: 19, marginTop: 12 },
  clearFiltersLink: { marginTop: 14 },
  clearFiltersText: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.6 },
  noResultsButton: { marginTop: 22, height: 48, justifyContent: 'center', paddingHorizontal: 16 },
  noResultsButtonText: { fontFamily: fonts.heading, fontSize: 13, letterSpacing: 0.6 },
});
