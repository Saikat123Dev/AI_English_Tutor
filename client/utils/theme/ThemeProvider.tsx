import { createContext, ReactNode, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  error: string;
  border: string;
  borderError: string;
  card: string;
  placeholder: string;
}

export const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F7F9FC',
  text: '#1A1A1A',
  textSecondary: '#666666',
  primary: '#4353FD',
  error: '#E53935',
  border: '#E1E8ED',
  borderError: '#E53935',
  card: '#FFFFFF',
  placeholder: '#A0A0A0',
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B8C1',
  primary: '#6C63FF',
  error: '#FF6B6B',
  border: '#2F363D',
  borderError: '#FF6B6B',
  card: '#1E1E1E',
  placeholder: '#888888',
};

export interface ThemeContextType {
  theme: ThemeColors;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeType: 'system',
  setThemeType: () => {},
  isDark: false,
  toggleTheme: () => {},
  colors: lightTheme,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');

  const isDark =
    themeType === 'system'
      ? colorScheme === 'dark'
      : themeType === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setThemeType(themeType === 'dark' ? 'light' : 'dark');
  };

  const contextValue: ThemeContextType = {
    theme,
    themeType,
    setThemeType,
    isDark,
    toggleTheme,
    colors: theme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
