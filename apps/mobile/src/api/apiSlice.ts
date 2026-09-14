import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as SecureStore from 'expo-secure-store';

// TODO: move to app config / .env once apps/api exists (Phase 0 of PLAN.md).
// Points at a local dev server by default.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Single RTK Query base API. Feature endpoints (auth, links, categories,
 * tags) should be injected into this via `apiSlice.injectEndpoints` in
 * their own files rather than creating separate `createApi` instances —
 * that keeps the cache and tag-invalidation graph in one place, which
 * PLAN.md §1.4 relies on for the filter/search layer to double as the
 * base for Smart Collections later.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Link', 'Category', 'Tag', 'User'],
  endpoints: () => ({}),
});
