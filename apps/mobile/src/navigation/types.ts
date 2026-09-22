import type { LinkFilterState } from '../lib/linkFilters';

/**
 * Route params for the whole app. Keep this in sync as screens gain
 * real params (e.g. AddLink taking a shared URL, LinkDetail/EditLink
 * taking a linkId). Screen-to-route mapping decisions are documented
 * inline in RootNavigator.tsx where they deviate from a 1:1 reading of
 * PROJECT.md §14.6 — several "screens" in the design are UI *states* of
 * one route, not separate routes.
 */

export type MainTabParamList = {
  // justSaved is set by AddLinkScreen (once built) navigating back to Home
  // after a save, to drive the saved-toast state (PROJECT.md §14.6) —
  // see HomeScreen.tsx.
  Home: { justSaved?: { title: string; category: string } } | undefined;
  // Set by Browse's Tags list (and anywhere else that wants to hand off
  // a starting query) so Search doesn't open on its idle state. `filters`
  // is set by FiltersScreen on "SHOW N LINKS" (see src/lib/linkFilters.ts).
  Search: { initialQuery?: string; filters?: LinkFilterState } | undefined;
  Browse: undefined;
  Saved: undefined;
  You: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  // Supports navigating straight to a tab screen with params, e.g.
  // navigation.navigate('Main', { screen: 'Home', params: { justSaved } }).
  Main: { screen?: keyof MainTabParamList; params?: MainTabParamList[keyof MainTabParamList] } | undefined;
  AddLink: { sharedUrl?: string } | undefined;
  LinkDetail: { linkId: string };
  EditLink: { linkId: string };
  CategoryDetail: { categoryId: string };
  Filters: undefined;
};
