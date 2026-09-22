import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip } from '../../components/Chip';
import { LinkRow } from '../../components/LinkRow';
import { ScreenContainer } from '../../components/ScreenContainer';
import { categoryById, linkCountForCategory, subCategoriesOf } from '../../mocks/categories';
import { linksInCategory } from '../../mocks/links';
import { useAppSelector } from '../../store/hooks';
import { selectAllLinks } from '../../store/linksSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth, type } from '../../theme/tokens';

// Design ref: Screen.dc.html — is.categoryDetail
export function CategoryDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryId: string = route.params?.categoryId;
  const sourceLinks = useAppSelector(selectAllLinks);

  const category = categoryById(categoryId);
  const subs = useMemo(() => subCategoriesOf(categoryId), [categoryId]);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const allLinks = useMemo(
    () =>
      selectedSub
        ? linksInCategory(selectedSub, sourceLinks)
        : subs.flatMap((s) => linksInCategory(s.id, sourceLinks)),
    [selectedSub, subs, sourceLinks]
  );
  const links = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? allLinks.filter((l) => l.title.toLowerCase().includes(q)) : allLinks;
  }, [allLinks, search]);
  const unreadCount = allLinks.filter((l) => l.status === 'Unread').length;

  if (!category) {
    return (
      <ScreenContainer style={styles.notFound}>
        <Text style={{ color: colors.muted }}>Category not found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: colors.muted }]}>← CATEGORIES</Text>
        </Pressable>
        {/* TODO: wire to real category editing once apps/api exists. */}
        <Pressable>
          <Text style={[styles.edit, { color: colors.accent }]}>EDIT</Text>
        </Pressable>
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: colors.ink }]}>{category.name}</Text>
        <Text style={[styles.stats, { color: colors.muted }]}>
          {allLinks.length} links · {subs.length} sub-categories · {unreadCount} unread
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={`Search within ${category.name}`}
          placeholderTextColor={colors.muted}
          style={[styles.search, { borderColor: colors.rule, color: colors.ink }]}
        />
      </View>

      <View style={styles.chipRow}>
        <FlatList
          data={[{ id: null as string | null, name: `All ${allLinks.length}` }, ...subs.map((s) => ({ id: s.id, name: `${s.name} ${linkCountForCategory(s.id, sourceLinks)}` }))]}
          keyExtractor={(item) => item.id ?? 'all'}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 7 }}
          renderItem={({ item }) => (
            <Chip
              label={item.name}
              active={selectedSub === item.id}
              onPress={() => setSelectedSub(item.id)}
            />
          )}
        />
      </View>

      <View style={[styles.sortRow, { borderTopColor: colors.rule, borderTopWidth: ruleWidth, borderBottomColor: colors.line, borderBottomWidth: hairlineWidth }]}>
        <Text style={[styles.sortLabel, { color: colors.muted }]}>NEWEST FIRST</Text>
        <Pressable onPress={() => navigation.navigate('Filters')}>
          <Text style={[styles.filterLink, { color: colors.accent }]}>FILTER · SORT</Text>
        </Pressable>
      </View>

      <FlatList
        data={links}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => (
          <LinkRow link={item} onOpen={() => navigation.navigate('LinkDetail', { linkId: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.muted }]}>No links here yet.</Text>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notFound: { alignItems: 'center', justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  back: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  edit: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  titleBlock: { paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontFamily: fonts.heading, fontSize: 30, letterSpacing: -0.4 },
  stats: { fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 14 },
  search: { borderWidth: 2, padding: 11, fontFamily: fonts.body, fontSize: 13.5 },
  chipRow: { paddingLeft: 20, paddingBottom: 14 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  sortLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.6 },
  filterLink: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.6 },
  empty: { fontFamily: fonts.body, fontSize: type.body, padding: 20, textAlign: 'center' },
});
