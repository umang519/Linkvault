import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Chip } from '../../components/Chip';
import { LinkRow } from '../../components/LinkRow';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StatusPickerDialog } from '../../components/StatusPickerDialog';
import { matchesSearchText } from '../../lib/linkFilters';
import { categoryById, topLevelCategories } from '../../mocks/categories';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectAllLinks, setStatus } from '../../store/linksSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth, type } from '../../theme/tokens';
import { STATUS_SEQUENCE, type Link, type LinkStatus } from '../../types/models';

type Tab = 'favorites' | 'status';

// Design ref: Screen.dc.html — is.favorites / is.emptyFav / is.status are
// states/tabs of this one route (CLAUDE.md: "Saved nests Favorites/
// Status", same in-tab chip-switch pattern as BrowseScreen). Status rows
// get a swipe-to-advance gesture AND a long-press fallback menu with the
// same options — PROJECT.md §14.9 (accessibility: swipe alone isn't
// discoverable or assistive-tech-friendly).
export function SavedScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const links = useAppSelector(selectAllLinks);
  const [tab, setTab] = useState<Tab>('favorites');

  const favorites = useMemo(() => links.filter((l) => l.isFavorite), [links]);

  return (
    <ScreenContainer>
      <View style={styles.tabChipRow}>
        <Chip label="Favorites" active={tab === 'favorites'} onPress={() => setTab('favorites')} />
        <Chip label="Status" active={tab === 'status'} onPress={() => setTab('status')} />
      </View>

      {tab === 'favorites' ? (
        <FavoritesView
          favorites={favorites}
          onBrowse={() => navigation.navigate('Home')}
          onOpen={(id) => navigation.navigate('LinkDetail', { linkId: id })}
        />
      ) : (
        <StatusView links={links} onOpen={(id) => navigation.navigate('LinkDetail', { linkId: id })} />
      )}
    </ScreenContainer>
  );
}

function FavoritesView({
  favorites,
  onBrowse,
  onOpen,
}: {
  favorites: Link[];
  onBrowse: () => void;
  onOpen: (id: string) => void;
}) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of favorites) {
      const cat = l.categoryId ? categoryById(l.categoryId) : undefined;
      const top = cat?.parentId ? categoryById(cat.parentId) : cat;
      if (top) counts.set(top.id, (counts.get(top.id) ?? 0) + 1);
    }
    return topLevelCategories()
      .filter((c) => counts.has(c.id))
      .map((c) => ({ id: c.id, name: c.name, n: counts.get(c.id) ?? 0 }))
      .sort((a, b) => b.n - a.n);
  }, [favorites]);

  const results = useMemo(() => {
    let list = favorites;
    if (categoryFilter) {
      list = list.filter((l) => {
        const cat = l.categoryId ? categoryById(l.categoryId) : undefined;
        const top = cat?.parentId ? categoryById(cat.parentId) : cat;
        return top?.id === categoryFilter;
      });
    }
    if (query.trim()) list = list.filter((l) => matchesSearchText(l, query));
    return list;
  }, [favorites, categoryFilter, query]);

  if (favorites.length === 0) {
    return (
      <>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.ink }]}>Favorites</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Nothing marked yet</Text>
        </View>
        <View style={[styles.emptyBanded, { borderTopColor: colors.rule, borderBottomColor: colors.rule }]}>
          <Text style={[styles.emptyTitle, { color: colors.ink }]}>
            Favorites are for the{'\n'}ten links you reopen.
          </Text>
          <Text style={[styles.emptyBody, { color: colors.muted }]}>
            Status tracks what you're working through. Favorite marks what you return to — docs, dashboards, the
            GMP tracker.
          </Text>
          <Pressable onPress={onBrowse} style={[styles.emptyBtn, { borderColor: colors.rule }]}>
            <Text style={[styles.emptyBtnText, { color: colors.ink }]}>BROWSE THE LIBRARY</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.ink }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {favorites.length} {favorites.length === 1 ? 'link' : 'links'} you keep coming back to
        </Text>
      </View>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search favorites"
          placeholderTextColor={colors.muted}
          style={[styles.search, { borderColor: colors.rule, color: colors.ink }]}
        />
      </View>
      <View style={styles.chipRow}>
        <Chip label={`All ${favorites.length}`} active={categoryFilter === null} onPress={() => setCategoryFilter(null)} />
        {categoryOptions.map((c) => (
          <Chip key={c.id} label={`${c.name} ${c.n}`} active={categoryFilter === c.id} onPress={() => setCategoryFilter(c.id)} />
        ))}
      </View>
      <FlatList
        data={results}
        keyExtractor={(l) => l.id}
        style={{ borderTopWidth: ruleWidth, borderTopColor: colors.rule }}
        renderItem={({ item }) => <LinkRow link={item} onOpen={() => onOpen(item.id)} />}
      />
    </>
  );
}

function StatusView({ links, onOpen }: { links: Link[]; onOpen: (id: string) => void }) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<LinkStatus>('To Read');
  const [pickerFor, setPickerFor] = useState<Link | null>(null);
  const swipeRefs = useMemo(() => new Map<string, Swipeable | null>(), []);

  const counts = useMemo(() => {
    const m = new Map<LinkStatus, number>();
    for (const s of STATUS_SEQUENCE) m.set(s, 0);
    for (const l of links) m.set(l.status, (m.get(l.status) ?? 0) + 1);
    return m;
  }, [links]);

  const results = useMemo(() => links.filter((l) => l.status === selected), [links, selected]);
  const nextIndex = STATUS_SEQUENCE.indexOf(selected) + 1;
  const nextStatus = nextIndex < STATUS_SEQUENCE.length ? STATUS_SEQUENCE[nextIndex] : null;

  function advance(link: Link) {
    const i = STATUS_SEQUENCE.indexOf(link.status);
    const next = STATUS_SEQUENCE[i + 1];
    if (next) dispatch(setStatus({ id: link.id, status: next }));
    swipeRefs.get(link.id)?.close();
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.ink }]}>{selected}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Swipe a row to move it along</Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STATUS_SEQUENCE}
        keyExtractor={(s) => s}
        contentContainerStyle={styles.chipRow}
        renderItem={({ item }) => (
          <Chip label={`${item} ${counts.get(item) ?? 0}`} active={selected === item} onPress={() => setSelected(item)} />
        )}
      />
      <FlatList
        data={results}
        keyExtractor={(l) => l.id}
        style={{ borderTopWidth: ruleWidth, borderTopColor: colors.rule }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.muted }]}>Nothing in {selected} right now.</Text>
        }
        renderItem={({ item }) => (
          <Swipeable
            ref={(r) => {
              swipeRefs.set(item.id, r);
            }}
            renderRightActions={
              nextStatus
                ? () => (
                    <Pressable onPress={() => advance(item)} style={[styles.swipeAction, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.swipeActionText, { color: colors.inverse }]}>→ {nextStatus.toUpperCase()}</Text>
                    </Pressable>
                  )
                : undefined
            }
          >
            <Pressable onLongPress={() => setPickerFor(item)} delayLongPress={400}>
              <LinkRow link={item} onOpen={() => onOpen(item.id)} />
            </Pressable>
          </Swipeable>
        )}
      />
      <StatusPickerDialog
        visible={!!pickerFor}
        current={pickerFor?.status ?? 'Unread'}
        onClose={() => setPickerFor(null)}
        onSelect={(s) => pickerFor && dispatch(setStatus({ id: pickerFor.id, status: s }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabChipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  title: { fontFamily: fonts.heading, fontSize: 26, letterSpacing: -0.4 },
  subtitle: { fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 14 },
  search: { borderWidth: 2, padding: 11, fontFamily: fonts.body, fontSize: 13.5 },
  chipRow: { flexDirection: 'row', gap: 7, paddingHorizontal: 20, paddingBottom: 14 },
  empty: { fontFamily: fonts.body, fontSize: type.body, padding: 20, textAlign: 'center' },
  emptyBanded: { margin: 20, borderTopWidth: ruleWidth, borderBottomWidth: ruleWidth, paddingVertical: 26 },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 24 },
  emptyBody: { fontFamily: fonts.body, fontSize: type.body, lineHeight: 20, marginTop: 12 },
  emptyBtn: { marginTop: 20, height: 48, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  emptyBtnText: { fontFamily: fonts.heading, fontSize: 12.5, letterSpacing: 0.5 },
  swipeAction: { width: 96, alignItems: 'center', justifyContent: 'center' },
  swipeActionText: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.4, textAlign: 'center' },
});
