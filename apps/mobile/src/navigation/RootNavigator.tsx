import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AddLinkScreen } from '../screens/save/AddLinkScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { CategoryDetailScreen } from '../screens/browse/CategoryDetailScreen';
import { FiltersScreen } from '../screens/search/FiltersScreen';
import { EditLinkScreen } from '../screens/link/EditLinkScreen';
import { LinkDetailScreen } from '../screens/link/LinkDetailScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Route-to-screen mapping decisions (see PROJECT.md §14.6 for the full
 * 31-screen design inventory this maps from):
 *
 * - Several design "screens" are UI *states* of one route, handled inside
 *   that screen component rather than as separate stack entries: Home
 *   covers loading / empty-library / saved-toast / offline / net-error;
 *   Search covers idle / results / no-results; Add Link covers the
 *   fetching / metadata-failed / invalid-URL / duplicate states; Browse
 *   covers Categories / Collections / Tags behind its chip row; Saved
 *   covers Favorites / Status.
 * - Delete confirmation is a dialog opened from Link Detail / Edit Link,
 *   not a route.
 * - The OS share-sheet variant of Add Link is a native share-extension
 *   entry point, not an in-app navigation target — tracked separately in
 *   PLAN.md §1.6.
 *
 * TODO(auth): this always renders the auth stack first. Swap the
 * initial route once real auth state exists (Phase 1.1) — check a
 * stored session token and start on Main when one is present.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AddLink" component={AddLinkScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="LinkDetail" component={LinkDetailScreen} />
      <Stack.Screen name="EditLink" component={EditLinkScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="Filters" component={FiltersScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
