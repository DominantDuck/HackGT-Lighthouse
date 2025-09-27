import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Dose } from '@/types/api';

interface DoseChipProps {
  dose: Dose;
  status?: 'upcoming' | 'due' | 'late' | 'taken' | 'missed';
  size?: 'small' | 'medium' | 'large';
  showTime?: boolean;
  showAmount?: boolean;
  showUnit?: boolean;
  style?: ViewStyle;
}

export function DoseChip({
  dose,
  status = 'upcoming',
  size = 'medium',
  showTime = true,
  showAmount = true,
  showUnit = true,
  style,
}: DoseChipProps) {
  const { colors, spacing, typography } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'taken':
        return colors.onTime;
      case 'due':
        return colors.warning;
      case 'late':
        return colors.late;
      case 'missed':
        return colors.missed;
      case 'upcoming':
      default:
        return colors.textSecondary;
    }
  };

  const getStatusBackground = () => {
    const baseColor = getStatusColor();
    return status === 'taken' ? `${baseColor}20` : `${baseColor}10`;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: 6,
          minHeight: 24,
        };
      case 'large':
        return {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 8,
          minHeight: 36,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: 6,
          minHeight: 28,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return typography.caption;
      case 'large':
        return typography.body;
      case 'medium':
      default:
        return typography.bodySmall;
    }
  };

  const formatTime = (timeWindow: string) => {
    // Handle time windows like "08:00" or "18:00@Wed"
    const time = timeWindow.split('@')[0];
    return time;
  };

  const formatAmount = (amount: number, unit: string) => {
    if (unit === 'pill' && amount === 1) {
      return '1 pill';
    } else if (unit === 'pill') {
      return `${amount} pills`;
    } else {
      return `${amount} ${unit}`;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'taken':
        return 'Taken';
      case 'due':
        return 'Due now';
      case 'late':
        return 'Late';
      case 'missed':
        return 'Missed';
      case 'upcoming':
      default:
        return 'Upcoming';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getStatusBackground(),
          borderColor: getStatusColor(),
          ...getSizeStyles(),
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {showTime && (
          <Text
            style={[
              getTextSize(),
              {
                color: getStatusColor(),
                fontWeight: '600',
              },
            ]}
          >
            {formatTime(dose.time_window)}
          </Text>
        )}
        
        {showAmount && (
          <Text
            style={[
              getTextSize(),
              {
                color: getStatusColor(),
                marginLeft: showTime ? spacing.xs : 0,
              },
            ]}
          >
            {formatAmount(dose.amount, dose.unit)}
          </Text>
        )}

        {dose.with_food && (
          <Text
            style={[
              getTextSize(),
              {
                color: getStatusColor(),
                marginLeft: spacing.xs,
                fontStyle: 'italic',
              },
            ]}
          >
            with food
          </Text>
        )}
      </View>

      <Text
        style={[
          getTextSize(),
          {
            color: getStatusColor(),
            fontWeight: '500',
            marginTop: spacing.xs,
          },
        ]}
      >
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
