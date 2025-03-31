import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export const themes = {
  light: {
    background: '#FFFFFF',
    surface: '#F7F9FC',
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#3498DB',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E1E8ED',
    gradient: ['#F7F9FC', '#ECF0F3'],
    cardGradient: ['#FFFFFF', '#F7F9FC'],
  },
  dark: {
    background: '#1A1F24',
    surface: '#22272E',
    primary: '#3498DB',
    secondary: '#2980B9',
    accent: '#4FB3FF',
    text: '#FFFFFF',
    textSecondary: '#B0B8C1',
    border: '#2F363D',
    gradient: ['#1A1F24', '#22272E'],
    cardGradient: ['#22272E', '#2A3137'],
  },
};

export const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);