import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/features/auth/useAuth';
import { useReports, useGenerateReport } from './reports.api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export function ReportsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: reports, isLoading, refetch } = useReports(user?.id || '');
  const generateReportMutation = useGenerateReport();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const result = await generateReportMutation.mutateAsync(user?.id || '');
      Alert.alert(
        'Report Generated',
        'Your weekly report has been generated successfully.',
        [
          {
            text: 'View Report',
            onPress: () => {
              // Navigate to report viewer
              console.log('Navigate to report:', result.url);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  const handleViewReport = (url: string) => {
    // Navigate to report viewer
    console.log('View report:', url);
  };

  const handleShareReport = async (url: string, title: string) => {
    try {
      await Share.share({
        message: `Weekly Medication Report: ${title}`,
        url: url,
        title: title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share report.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatWeekRange = (weekStart: string, weekEnd: string) => {
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading reports...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Generate Report Section */}
        <Card style={styles.generateCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Generate New Report
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Create a weekly medication adherence report for your care team.
          </Text>
          <Button
            title="Generate Weekly Report"
            onPress={handleGenerateReport}
            loading={generateReportMutation.isPending}
            disabled={generateReportMutation.isPending}
            fullWidth
            style={styles.generateButton}
          />
        </Card>

        {/* Reports List */}
        {!reports || reports.length === 0 ? (
          <EmptyState
            icon={<Text style={styles.emptyIcon}>📊</Text>}
            title="No Reports Yet"
            message="Generate your first weekly report to track your medication adherence over time."
            actionLabel="Generate Report"
            onAction={handleGenerateReport}
          />
        ) : (
          <Card style={styles.reportsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Reports ({reports.length})
            </Text>
            <View style={styles.reportsList}>
              {reports.map((report) => (
                <Card key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text style={[styles.reportTitle, { color: colors.text }]}>
                        Weekly Report
                      </Text>
                      <Text style={[styles.reportDate, { color: colors.textSecondary }]}>
                        {formatWeekRange(report.week_start, report.week_end)}
                      </Text>
                      <Text style={[styles.reportGenerated, { color: colors.textTertiary }]}>
                        Generated {formatDate(report.generated_at)}
                      </Text>
                    </View>
                    <View style={styles.reportActions}>
                      <Button
                        title="View"
                        variant="primary"
                        size="small"
                        onPress={() => handleViewReport(report.url)}
                      />
                      <Button
                        title="Share"
                        variant="outline"
                        size="small"
                        onPress={() => handleShareReport(report.url, `Weekly Report ${formatWeekRange(report.week_start, report.week_end)}`)}
                      />
                    </View>
                  </View>

                  {/* Report Summary */}
                  <View style={styles.reportSummary}>
                    <Text style={[styles.summaryTitle, { color: colors.text }]}>
                      Summary
                    </Text>
                    <View style={styles.summaryStats}>
                      <View style={styles.summaryStat}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                          {Math.round(report.summary.adherence_rate)}%
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                          Adherence
                        </Text>
                      </View>
                      <View style={styles.summaryStat}>
                        <Text style={[styles.statValue, { color: colors.error }]}>
                          {report.summary.missed_doses}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                          Missed
                        </Text>
                      </View>
                      <View style={styles.summaryStat}>
                        <Text style={[styles.statValue, { color: colors.warning }]}>
                          {report.summary.side_effects_reported}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                          Side Effects
                        </Text>
                      </View>
                    </View>

                    {/* Risk Factors */}
                    {report.summary.risk_factors.length > 0 && (
                      <View style={styles.riskFactors}>
                        <Text style={[styles.riskFactorsTitle, { color: colors.warning }]}>
                          Risk Factors
                        </Text>
                        {report.summary.risk_factors.map((factor, index) => (
                          <Text key={index} style={[styles.riskFactor, { color: colors.textSecondary }]}>
                            • {factor}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  generateCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  reportsCard: {
    marginBottom: 16,
  },
  reportsList: {
    gap: 16,
  },
  reportCard: {
    gap: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportInfo: {
    flex: 1,
    gap: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 14,
  },
  reportGenerated: {
    fontSize: 12,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reportSummary: {
    gap: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  riskFactors: {
    gap: 4,
  },
  riskFactorsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskFactor: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyIcon: {
    fontSize: 48,
  },
});
