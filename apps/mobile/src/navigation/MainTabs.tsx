import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { TabBar } from '../components/TabBar';
import { BrowseScreen } from '../screens/browse/BrowseScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SavedScreen } from '../screens/saved/SavedScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Five tabs — Home, Search, Browse, Saved, You — per PROJECT.md §14.4.
 * Uses the custom TabBar (ported from TabBar.dc.html) which also renders
 * the floating "SAVE LINK" block, so no built-in tab-bar chrome is used.
 */
export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse' }} />
      <Tab.Screen name="Saved" component={SavedScreen} options={{ title: 'Saved' }} />
      <Tab.Screen name="You" component={SettingsScreen} options={{ title: 'You' }} />
    </Tab.Navigator>
  );
}
