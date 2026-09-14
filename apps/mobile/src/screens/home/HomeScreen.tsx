import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinkRow } from '../../components/LinkRow';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SkeletonRow } from '../../components/Skeleton';
import { Toast } from '../../components/Toast';
import { useMockLinks } from '../../hooks/useMockLinks';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, hairlineWidth, ruleWidth, type } from '../../theme/tokens';

/**
 * Design ref: Screen.dc.html — is.home / is.loading / is.emptyLib /
 * is.savedToast are states of this one route (see RootNavigator.tsx for
 * why those aren't separate routes). `useMockLinks` stands in for the
 * real `useGetLinksQuery()` — see PLAN.md §1.4 / src/hooks/useMockLinks.ts.
 */
export function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data: links, isLoading } = useMockLinks();

  const [toast, setToast] = useState<{ title: string; category: string } | null>(null);

  useEffect(() => {
    const justSaved = route.params?.justSaved;
    if (justSaved) {
      setToast(justSaved);
      navigation.setParams({ justSaved: undefined }); // consume it — don't re-show on next focus
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [route.params?.justSaved]);

  const quick = [
    { n: 18, label: 'Favorites', route: 'Saved' },
    { n: 12, label: 'To read', route: 'Saved' },
    { n: 6, label: 'Categories', route: 'Browse' },
    { n: 41, label: 'Tags', route: 'Browse' },
  ];

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.brand, { color: colors.ink }]}>LINKVAULT</Text>
        <Pressable
          onPress={() => navigation.navigate('You')}
          style={[styles.avatar, { borderColor: colors.rule }]}
        >
          <Text style={[styles.avatarText, { color: colors.ink }]}>RT</Text>
        </Pressable>
      </View>

      <View style={styles.greetingBlock}>
        <Text style={[styles.greeting, { color: colors.ink }]}>Good evening, Ravi.</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>
          {isLoading ? ' ' : `${links.length} links · 12 waiting to be read`}
        </Text>
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

      <View style={[styles.listArea, { borderTopColor: colors.line, borderTopWidth: hairlineWidth }]}>
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : links.length === 0 ? (
          <EmptyLibrary onPasteUrl={() => navigation.navigate('AddLink')} />
        ) : (
          <FlatList
            data={links}
            keyExtractor={(l) => l.id}
            renderItem={({ item }) => (
              <LinkRow link={item} onOpen={() => navigation.navigate('LinkDetail', { linkId: item.id })} />
            )}
          />
        )}
      </View>

      {toast ? (
        <View style={styles.toastWrap}>
          <Toast
            title={`SAVED TO ${toast.category.toUpperCase()}`}
            subtitle={toast.title}
            onUndo={() => setToast(null)}
            onView={() => setToast(null)}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

function EmptyLibrary({ onPasteUrl }: { onPasteUrl: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.empty, { borderTopColor: colors.rule, borderBottomColor: colors.rule }]}>
      <Text style={[styles.emptyTitle, { color: colors.ink }]}>
        Save your first link{'\n'}in two taps.
      </Text>
      <Text style={[styles.emptyBody, { color: colors.muted }]}>
        From any app — YouTube, Chrome, WhatsApp — tap Share and pick LinkVault.
        The title and preview fill themselves in.
      </Text>
      <Pressable style={[styles.emptyButton, { backgroundColor: colors.accent }]} onPress={onPasteUrl}>
        <Text style={[styles.emptyButtonText, { color: colors.inverse }]}>PASTE A URL</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6,
  },
  brand: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 2.2 },
  avatar: { width: 32, height: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, fontSize: 11 },
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
  listArea: { flex: 1 },
  empty: { margin: 20, borderTopWidth: ruleWidth, borderBottomWidth: ruleWidth, paddingVertical: 24 },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 24 },
  emptyBody: { fontFamily: fonts.body, fontSize: type.body, lineHeight: 19, marginTop: 12 },
  emptyButton: { marginTop: 20, height: 50, justifyContent: 'center', paddingHorizontal: 16 },
  emptyButtonText: { fontFamily: fonts.heading, fontSize: 13.5, letterSpacing: 0.6 },
  toastWrap: { position: 'absolute', left: 16, right: 16, bottom: 124 },
});
