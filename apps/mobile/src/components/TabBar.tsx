// Direct subpath import — the barrel (`@expo/vector-icons`) eagerly
// requires every icon family (Ionicons, MaterialCommunityIcons' 1.3MB
// font, FontAwesome, etc.) even though only Feather is used here,
// needlessly inflating the bundle/asset payload.
import Feather from '@expo/vector-icons/Feather';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';

const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Home: 'home',
  Search: 'search',
  Browse: 'folder',
  Saved: 'bookmark',
  You: 'user',
};

/**
 * Ported from Mobile app design prompt/TabBar.dc.html: five tabs plus a
 * floating red "SAVE LINK" block anchored bottom-right, in thumb reach
 * (PROJECT.md §14.4). The Save block always navigates to Add Link
 * regardless of the active tab, so it's wired here rather than as a
 * sixth tab.
 *
 * DEVIATION FROM THE DESIGN (by explicit request): the design's tab bar
 * is icon-free — PROJECT.md §14.1 states rank/count/rule-weight replace
 * icons throughout, and the original markup here used a small 18×3
 * underline mark instead of an icon (see TabBar.dc.html). Icons were
 * added to this one component only; every other icon-free rule in the
 * design (categories, link rows, status, etc.) is unchanged. Uses
 * Feather (thin stroke, no fill) rather than a rounded/filled set to
 * stay as close to the flat, geometric Modernist look as an icon can.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => navigation.navigate('AddLink' as never)}
        style={[styles.saveBlock, { backgroundColor: colors.accent }]}
      >
        <Text style={[styles.saveText, { color: colors.inverse }]}>SAVE{'\n'}LINK</Text>
      </Pressable>
      <View style={[styles.bar, { borderTopColor: colors.rule, backgroundColor: colors.bg }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const color = isFocused ? colors.accent : colors.muted;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name as never)}
              style={styles.tab}
            >
              <Feather name={TAB_ICONS[route.name] ?? 'circle'} size={20} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  saveBlock: {
    position: 'absolute',
    right: 20,
    bottom: 74,
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 6,
  },
  saveText: { fontFamily: fonts.heading, fontSize: 11, letterSpacing: 1, textAlign: 'center', lineHeight: 13 },
  bar: { flexDirection: 'row', borderTopWidth: 2, paddingBottom: 18, paddingTop: 11 },
  tab: { flex: 1, alignItems: 'center', gap: 6 },
  tabLabel: { fontFamily: fonts.heading, fontSize: 9.5, letterSpacing: 0.9, textTransform: 'uppercase' },
});
