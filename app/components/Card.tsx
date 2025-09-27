import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
}

export function Card({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  onPress,
  disabled = false,
  style,
  ...props
}: CardProps) {
  const { colors, spacing, shadows } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    };

    // Variant styles
    const variantStyles = {
      default: {
        ...shadows.small,
      },
      elevated: {
        ...shadows.medium,
        borderWidth: 0,
      },
      outlined: {
        borderWidth: 1,
        borderColor: colors.border,
        shadowOpacity: 0,
        elevation: 0,
      },
    };

    // Padding styles
    const paddingStyles = {
      none: { padding: 0 },
      small: { padding: spacing.sm },
      medium: { padding: spacing.md },
      large: { padding: spacing.lg },
    };

    // Margin styles
    const marginStyles = {
      none: { margin: 0 },
      small: { margin: spacing.sm },
      medium: { margin: spacing.md },
      large: { margin: spacing.lg },
    };

    const disabledStyle = disabled
      ? {
          opacity: 0.6,
        }
      : {};

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...disabledStyle,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}
