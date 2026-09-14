import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';

/**
 * Ported from Mobile app design prompt/TabBar.dc.html: five tabs plus a
 * floating red "SAVE LINK" block anchored bottom-right, in thumb reach
 * (PROJECT.md §14.4). The Save block always navigates to Add Link
 * regardless of the active tab, so it's wired here rather than as a
 * sixth tab.
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
              <View style={[styles.tabBarMark, { backgroundColor: isFocused ? colors.accent : 'transparent' }]} />
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
  tabBarMark: { width: 18, height: 3 },
  tabLabel: { fontFamily: fonts.heading, fontSize: 9.5, letterSpacing: 0.9, textTransform: 'uppercase' },
});
