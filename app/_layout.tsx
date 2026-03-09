import '@tamagui/native/setup-zeego';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui';
import { AppThemeName, ThemeModeProvider } from '../components/theme-mode';
import tamaguiConfig from '../tamagui.config.js';

const THEME_STORAGE_KEY = 'app-theme:v1';
const AVAILABLE_THEMES: AppThemeName[] = ['light', 'dark', 'brand', 'ocean'];

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const defaultTheme: AppThemeName = colorScheme === 'dark' ? 'dark' : 'light';
  const [themeName, setThemeName] = useState<AppThemeName>(defaultTheme);

  useEffect(() => {
    let isMounted = true;

    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!isMounted || !savedTheme) {
          return;
        }

        if (
          savedTheme === 'light' ||
          savedTheme === 'dark' ||
          savedTheme === 'brand' ||
          savedTheme === 'ocean'
        ) {
          setThemeName(savedTheme);
        }
      } catch {
        // Keep the current default theme if persisted read fails.
      }
    };

    loadTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(THEME_STORAGE_KEY, themeName).catch(() => {
      // Ignore persistence failures to avoid blocking UI rendering.
    });
  }, [themeName]);

  const cycleTheme = () => {
    const currentIndex = AVAILABLE_THEMES.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
    setThemeName(AVAILABLE_THEMES[nextIndex]);
  };

  const themeModeValue = useMemo(
    () => ({
      availableThemes: AVAILABLE_THEMES,
      themeName,
      setThemeName,
      cycleTheme,
    }),
    [themeName]
  );

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={themeName}>
      <ThemeModeProvider value={themeModeValue}>
        <Theme name={themeName}>
          <Stack screenOptions={{ headerShown: false }} />
        </Theme>
      </ThemeModeProvider>
    </TamaguiProvider>
  );
}
