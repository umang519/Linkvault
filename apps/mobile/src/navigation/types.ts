/**
 * Route params for the whole app. Keep this in sync as screens gain
 * real params (e.g. AddLink taking a shared URL, LinkDetail/EditLink
 * taking a linkId). Screen-to-route mapping decisions are documented
 * inline in RootNavigator.tsx where they deviate from a 1:1 reading of
 * PROJECT.md §14.6 — several "screens" in the design are UI *states* of
 * one route, not separate routes.
 */

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Browse: undefined;
  Saved: undefined;
  You: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  AddLink: { sharedUrl?: string } | undefined;
  LinkDetail: { linkId: string };
  EditLink: { linkId: string };
  CategoryDetail: { categoryId: string };
  Filters: undefined;
};
