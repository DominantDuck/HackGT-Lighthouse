import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, AppSettings } from '../../types/api';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colors: typeof lightColors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Color tokens
const lightColors = {
  primary: '#007AFF',
  primaryDark: '#0056CC',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceVariant: '#E5E5EA',
  
  text: '#000000',
  textSecondary: '#6D6D70',
  textTertiary: '#8E8E93',
  
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  
  card: '#FFFFFF',
  cardBorder: '#E5E5EA',
  
  // Status colors
  onTime: '#34C759',
  late: '#FF9500',
  missed: '#FF3B30',
  
  // Risk levels
  lowRisk: '#34C759',
  mediumRisk: '#FF9500',
  highRisk: '#FF3B30',
};

const darkColors = {
  primary: '#0A84FF',
  primaryDark: '#0056CC',
  secondary: '#5E5CE6',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#64D2FF',
  
  background: '#000000',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  
  border: '#38383A',
  borderLight: '#2C2C2E',
  
  card: '#1C1C1E',
  cardBorder: '#2C2C2E',
  
  // Status colors
  onTime: '#30D158',
  late: '#FF9F0A',
  missed: '#FF453A',
  
  // Risk levels
  lowRisk: '#30D158',
  mediumRisk: '#FF9F0A',
  highRisk: '#FF453A',
};

// Spacing tokens
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography tokens
const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

// Shadow tokens
const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    // Web-compatible boxShadow
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    // Web-compatible boxShadow
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    // Web-compatible boxShadow
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
};

const THEME_STORAGE_KEY = 'app_theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
          setThemeState(storedTheme as Theme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Update dark mode based on theme preference
  useEffect(() => {
    if (theme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    colors,
    spacing,
    typography,
    shadows,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
