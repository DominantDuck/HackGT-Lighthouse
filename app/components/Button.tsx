import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}: ButtonProps & { textStyle?: TextStyle }) {
  const { colors, spacing, typography, shadows } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      ...shadows.small,
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: colors.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      danger: {
        backgroundColor: colors.error,
        borderWidth: 0,
      },
    };

    const disabledStyle = disabled
      ? {
          backgroundColor: colors.surfaceVariant,
          borderColor: colors.border,
          opacity: 0.6,
        }
      : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeTextStyles = {
      small: typography.buttonSmall,
      medium: typography.button,
      large: typography.button,
    };

    const variantTextStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FFFFFF' },
      outline: { color: colors.primary },
      ghost: { color: colors.primary },
      danger: { color: '#FFFFFF' },
    };

    const disabledTextStyle = disabled
      ? { color: colors.textTertiary }
      : {};

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...disabledTextStyle,
    };
  };

  const getIconSpacing = () => {
    return size === 'small' ? spacing.xs : spacing.sm;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {leftIcon && (
            <React.Fragment>
              {leftIcon}
              <Text style={{ marginLeft: getIconSpacing() }} />
            </React.Fragment>
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && (
            <React.Fragment>
              <Text style={{ marginRight: getIconSpacing() }} />
              {rightIcon}
            </React.Fragment>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
