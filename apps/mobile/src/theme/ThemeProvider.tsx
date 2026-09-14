import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors } from './tokens';

export type AppearanceSetting = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  setting: AppearanceSetting;
  setSetting: (setting: AppearanceSetting) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Resolves the "Modernist" light/dark tokens against the Settings ›
 * Appearance choice (Light / Dark / System — see PROJECT.md §14.6,
 * "Saved, account, and failure" group). Dark mode is a straight token
 * swap, not a separate design (PROJECT.md §14.2) — screens should only
 * ever read colors from this provider, never hardcode a hex value.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [setting, setSetting] = useState<AppearanceSetting>('system');

  const isDark = setting === 'system' ? systemScheme === 'dark' : setting === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, isDark, setting, setSetting }),
    [colors, isDark, setting]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
