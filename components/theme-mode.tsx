import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

export type AppThemeName = 'light' | 'dark' | 'brand' | 'ocean';

type ThemeModeContextValue = {
  availableThemes: AppThemeName[];
  themeName: AppThemeName;
  setThemeName: (name: AppThemeName) => void;
  cycleTheme: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ThemeModeContextValue;
}) {
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider.');
  }

  return context;
}
