import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

interface ChartData {
  x: string | number;
  y: number;
  label?: string;
}

interface ChartProps {
  data: ChartData[];
  type?: 'line' | 'bar';
  height?: number;
  width?: number;
  showGrid?: boolean;
  showAxis?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function Chart({
  data,
  type = 'line',
  height = 200,
  width = 300,
  showGrid = true,
  showAxis = true,
  color,
  style,
}: ChartProps) {
  const { colors } = useTheme();
  const chartColor = color || colors.primary;

  return (
    <View style={[styles.container, { height, width }, style]}>
      <View style={styles.chartPlaceholder}>
        <Text style={[styles.chartText, { color: colors.text }]}>
          {type === 'line' ? 'Line Chart' : 'Bar Chart'}
        </Text>
        <Text style={[styles.chartSubtext, { color: colors.textSecondary }]}>
          {data.length} data points
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  chartText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 12,
  },
});
