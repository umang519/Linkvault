import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip } from '../../components/Chip';
import { ScreenContainer } from '../../components/ScreenContainer';
import { linkCountForCategory, subCategoriesOf, topLevelCategories } from '../../mocks/categories';
import { tagCounts } from '../../mocks/links';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, ruleWidth, type } from '../../theme/tokens';

type Tab = 'categories' | 'collections' | 'tags';

// Design ref: Screen.dc.html — is.categories / is.tags / is.collections are
// one segmented view switched by this chip row. Defaults to Categories
// per PROJECT.md §14.9 (Categories → Collections → Tags).
export function BrowseScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('categories');
  const categories = useMemo(() => topLevelCategories(), []);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>
            {tab === 'categories' ? 'Categories' : tab === 'collections' ? 'Collections' : 'Tags'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {tab === 'categories'
              ? `${categories.length} categories`
              : tab === 'tags'
                ? `${tagCounts().length} tags across the vault`
                : 'Saved filters, not folders'}
          </Text>
        </View>
        {tab !== 'collections' ? (
          // TODO: wire to a real "create category/tag" flow once apps/api exists.
          <Pressable style={[styles.newBtn, { backgroundColor: colors.accent }]}>
            <Text style={[styles.newBtnText, { color: colors.inverse }]}>NEW</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.chipRow}>
        <Chip label="Categories" active={tab === 'categories'} onPress={() => setTab('categories')} />
        <Chip label="Collections" active={tab === 'collections'} onPress={() => setTab('collections')} />
        <Chip label="Tags" active={tab === 'tags'} onPress={() => setTab('tags')} />
      </View>

      <View style={[styles.body, { borderTopColor: colors.rule, borderTopWidth: ruleWidth }]}>
        {tab === 'categories' ? (
          <FlatList
            data={categories}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <CategoryRow
                count={linkCountForCategory(item.id)}
                name={item.name}
                subs={subCategoriesOf(item.id).map((s) => s.name).join(' · ')}
                onPress={() => navigation.navigate('CategoryDetail', { categoryId: item.id })}
              />
            )}
          />
        ) : tab === 'tags' ? (
          <TagsList onPickTag={(name) => navigation.navigate('Search', { initialQuery: name })} />
        ) : (
          <CollectionsPlaceholder />
        )}
      </View>
    </ScreenContainer>
  );
}

function CategoryRow({
  count,
  name,
  subs,
  onPress,
}: {
  count: number;
  name: string;
  subs: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.categoryRow, { borderBottomColor: colors.line }]}>
      <Text style={[styles.categoryCount, { color: colors.accent }]}>{count}</Text>
      <View style={styles.categoryBody}>
        <Text style={[styles.categoryName, { color: colors.ink }]}>{name}</Text>
        <Text style={[styles.categorySubs, { color: colors.muted }]} numberOfLines={1}>{subs}</Text>
      </View>
      <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
    </Pressable>
  );
}

function TagsList({ onPickTag }: { onPickTag: (name: string) => void }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const tags = useMemo(() => {
    const all = tagCounts();
    const q = query.trim().toLowerCase();
    return q ? all.filter((t) => t.name.toLowerCase().includes(q)) : all;
  }, [query]);

  return (
    <View style={styles.tagsWrap}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search tags"
        placeholderTextColor={colors.muted}
        style={[styles.tagSearch, { borderColor: colors.rule, color: colors.ink }]}
      />
      <FlatList
        data={tags}
        keyExtractor={(t) => t.name}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPickTag(item.name)}
            style={[styles.tagRow, { borderBottomColor: colors.line }]}
          >
            <Text style={[styles.tagName, { color: colors.ink }]}>#{item.name}</Text>
            <Text style={[styles.tagCount, { color: colors.muted }]}>{item.n} LINKS</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function CollectionsPlaceholder() {
  const { colors } = useTheme();
  return (
    <View style={styles.collectionsEmpty}>
      <Text style={[styles.collectionsTitle, { color: colors.ink }]}>
        Collections are saved filters.
      </Text>
      <Text style={[styles.collectionsBody, { color: colors.muted }]}>
        Save a filter combination — a category, a tag, a status — as a named shortcut.
        This is a V2 feature (PROJECT.md §8 / PLAN.md Phase 2); the nav slot is here early
        so the shell doesn't need to change later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title: { fontFamily: fonts.heading, fontSize: 26, letterSpacing: -0.4 },
  subtitle: { fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  newBtn: { paddingHorizontal: 12, paddingVertical: 9 },
  newBtnText: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 0.6 },
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  body: { flex: 1 },
  categoryRow: { flexDirection: 'row', gap: 14, alignItems: 'baseline', borderBottomWidth: 1, paddingVertical: 15, paddingHorizontal: 20 },
  categoryCount: { fontFamily: fonts.heading, fontSize: 20, width: 38 },
  categoryBody: { flex: 1, minWidth: 0 },
  categoryName: { fontFamily: fonts.heading, fontSize: 16 },
  categorySubs: { fontFamily: fonts.body, fontSize: 11.5, marginTop: 3 },
  chevron: { fontSize: 14 },
  tagsWrap: { flex: 1 },
  tagSearch: { borderWidth: 2, marginHorizontal: 20, marginBottom: 14, padding: 11, fontFamily: fonts.body, fontSize: 13.5 },
  tagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderBottomWidth: 1, paddingVertical: 13, paddingHorizontal: 20 },
  tagName: { fontFamily: fonts.body, fontSize: 14.5 },
  tagCount: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.5 },
  collectionsEmpty: { padding: 20 },
  collectionsTitle: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 24 },
  collectionsBody: { fontFamily: fonts.body, fontSize: type.body, lineHeight: 19, marginTop: 12 },
});
