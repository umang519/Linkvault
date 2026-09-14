import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinkRow } from '../../components/LinkRow';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth, type } from '../../theme/tokens';
import type { Link } from '../../types/models';

/**
 * Design ref: Screen.dc.html — is.home (+ is.loading / is.emptyLib / is.savedToast
 * are the same route's loading, empty and just-saved states — see
 * RootNavigator.tsx for why those aren't separate routes).
 *
 * This screen is filled in as a worked example of the LinkRow / theme
 * token pattern for the rest of the screens to follow; the data below
 * is placeholder until apps/api + RTK Query endpoints exist (PLAN.md
 * Phase 0 / §1.4).
 */
export function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const quick = [
    { n: 18, label: 'Favorites', route: 'Saved' },
    { n: 12, label: 'To read', route: 'Saved' },
    { n: 6, label: 'Categories', route: 'Browse' },
    { n: 41, label: 'Tags', route: 'Browse' },
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.brand, { color: colors.ink }]}>LINKVAULT</Text>
      </View>

      <View style={styles.greetingBlock}>
        <Text style={[styles.greeting, { color: colors.ink }]}>Good evening, Ravi.</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>342 links · 12 waiting to be read</Text>
      </View>

      <View style={styles.searchWrap}>
        <Pressable
          onPress={() => navigation.navigate('Search')}
          style={[styles.searchField, { borderColor: colors.rule }]}
        >
          <Text style={[styles.searchPlaceholder, { color: colors.muted }]}>
            Search titles, tags, notes, URLs
          </Text>
          <Text style={[styles.searchAction, { color: colors.accent }]}>SEARCH</Text>
        </Pressable>
      </View>

      <View style={[styles.quickGrid, { borderTopColor: colors.rule, borderTopWidth: ruleWidth }]}>
        {quick.map((q) => (
          <Pressable
            key={q.label}
            onPress={() => navigation.navigate(q.route)}
            style={[styles.quickCell, { borderColor: colors.line }]}
          >
            <Text style={[styles.quickN, { color: colors.ink }]}>{q.n}</Text>
            <Text style={[styles.quickLabel, { color: colors.muted }]}>{q.label.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.recentHeader}>
        <Text style={[styles.recentTitle, { color: colors.ink }]}>RECENTLY ADDED</Text>
        <Pressable onPress={() => navigation.navigate('Filters')}>
          <Text style={[styles.filterLink, { color: colors.accent }]}>FILTER · SORT</Text>
        </Pressable>
      </View>

      <FlatList
        data={placeholderLinks}
        keyExtractor={(l) => l.id}
        style={{ borderTopWidth: hairlineWidth, borderTopColor: colors.line }}
        renderItem={({ item }) => (
          <LinkRow link={item} onOpen={() => navigation.navigate('LinkDetail', { linkId: item.id })} />
        )}
      />
    </ScreenContainer>
  );
}

const placeholderLinks: Link[] = [
  {
    id: 'usememo',
    userId: 'u1',
    title: 'useMemo & useCallback, properly explained',
    url: 'https://youtube.com/watch?v=THL1OPn72vo',
    description: '38 min — when memoisation actually helps and when it just costs you.',
    favicon: null,
    previewImage: null,
    categoryId: 'c-dev-react',
    tags: [{ id: 't1', userId: 'u1', name: 'react' }, { id: 't2', userId: 'u1', name: 'performance' }],
    status: 'Unread',
    isFavorite: false,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: null,
  },
  {
    id: 'ipo',
    userId: 'u1',
    title: 'IPO GMP Live — Grey Market Premium Tracker',
    url: 'https://investorgain.com/report/ipo-gmp-live/331/',
    description: 'Live grey-market premium table for every open and upcoming IPO.',
    favicon: null,
    previewImage: null,
    categoryId: 'c-finance-stocks',
    tags: [{ id: 't3', userId: 'u1', name: 'ipo' }, { id: 't4', userId: 'u1', name: 'gmp' }],
    status: 'To Read',
    isFavorite: true,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: null,
  },
];

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  brand: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 2.2 },
  greetingBlock: { paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { fontFamily: fonts.heading, fontSize: type.screenTitle, lineHeight: 31 },
  sub: { fontFamily: fonts.body, fontSize: type.secondary, marginTop: 6 },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 16 },
  searchField: {
    borderWidth: 2, padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  searchPlaceholder: { fontFamily: fonts.body, fontSize: 14 },
  searchAction: { fontFamily: fonts.heading, fontSize: 10, letterSpacing: 1 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  quickCell: { width: '50%', borderRightWidth: hairlineWidth, borderBottomWidth: hairlineWidth, padding: 14 },
  quickN: { fontFamily: fonts.heading, fontSize: 22 },
  quickLabel: { fontFamily: fonts.body, fontSize: type.label, letterSpacing: 1, marginTop: 4 },
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10,
  },
  recentTitle: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 1.4 },
  filterLink: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.6 },
});
