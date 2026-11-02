import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getAppTheme } from '../styles/theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isDarkMode: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('semar-theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // ignore localStorage access errors
  }
  return 'system';
}

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => defaultTheme || getInitialTheme());
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemPreference());

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleChange);
      return () => (mediaQuery as any).removeListener(handleChange);
    }
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDarkMode = resolvedTheme === 'dark';

  // Apply dark class and theme attributes to <html> and <body>
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }, [isDarkMode]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      localStorage.setItem('semar-theme', newTheme);
    } catch {
      // ignore storage write errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = isDarkMode ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [isDarkMode, setTheme]);

  const muiTheme = useMemo(() => getAppTheme(resolvedTheme), [resolvedTheme]);

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      resolvedTheme,
      isDarkMode,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, isDarkMode, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

