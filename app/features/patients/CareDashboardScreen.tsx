import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/features/auth/useAuth';
import { useCaregiverPatients } from './patients.api';
import { useAlerts } from '@/features/alerts/alerts.api';
import { Card } from '@/components/Card';
import { Chart } from '@/components/Chart';
import { EmptyState } from '@/components/EmptyState';

export function CareDashboardScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: patients, isLoading: patientsLoading, refetch: refetchPatients } = useCaregiverPatients(user?.id || '');
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useAlerts(user?.id || '');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPatients(),
        refetchAlerts(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate KPIs
  const getKPIs = () => {
    if (!patients || patients.length === 0) {
      return {
        totalPatients: 0,
        urgentAlerts: 0,
        repeatedMisses: 0,
        averageAdherence: 0,
      };
    }

    const urgentAlerts = alerts?.filter(alert => alert.level === 'urgent').length || 0;
    const repeatedMisses = alerts?.filter(alert => alert.type === 'repeated_miss').length || 0;
    
    // Mock average adherence calculation
    const averageAdherence = Math.round(Math.random() * 40 + 60); // 60-100%

    return {
      totalPatients: patients.length,
      urgentAlerts,
      repeatedMisses,
      averageAdherence,
    };
  };

  const getAdherenceData = () => {
    // Mock data for adherence trend
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      data.push({
        x: dayName,
        y: Math.round(Math.random() * 40 + 60), // 60-100%
      });
    }
    return data;
  };

  const getRiskDistribution = () => {
    if (!patients || patients.length === 0) return { low: 0, medium: 0, high: 0 };
    
    const distribution = { low: 0, medium: 0, high: 0 };
    patients.forEach(patient => {
      switch (patient.risk_level) {
        case 'low':
          distribution.low++;
          break;
        case 'medium':
          distribution.medium++;
          break;
        case 'high':
          distribution.high++;
          break;
      }
    });
    return distribution;
  };

  const kpis = getKPIs();
  const adherenceData = getAdherenceData();
  const riskDistribution = getRiskDistribution();

  if (patientsLoading || alertsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>👥</Text>}
          title="No Patients"
          message="You don't have any patients assigned yet. Contact your administrator to get started."
        />
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
        {/* KPIs Section */}
        <Card style={styles.kpisCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Overview
          </Text>
          <View style={styles.kpisGrid}>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: colors.primary }]}>
                {kpis.totalPatients}
              </Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                Total Patients
              </Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: colors.error }]}>
                {kpis.urgentAlerts}
              </Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                Urgent Alerts
              </Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: colors.warning }]}>
                {kpis.repeatedMisses}
              </Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                Repeated Misses
              </Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: colors.success }]}>
                {kpis.averageAdherence}%
              </Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                Avg Adherence
              </Text>
            </View>
          </View>
        </Card>

        {/* Adherence Trend */}
        <Card style={styles.chartCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Adherence Trend (7 Days)
          </Text>
          <Chart
            data={adherenceData}
            type="line"
            height={150}
            color={colors.primary}
          />
        </Card>

        {/* Risk Distribution */}
        <Card style={styles.riskCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Risk Distribution
          </Text>
          <View style={styles.riskStats}>
            <View style={styles.riskStat}>
              <View style={[styles.riskIndicator, { backgroundColor: colors.lowRisk }]} />
              <Text style={[styles.riskLabel, { color: colors.text }]}>
                Low Risk: {riskDistribution.low}
              </Text>
            </View>
            <View style={styles.riskStat}>
              <View style={[styles.riskIndicator, { backgroundColor: colors.mediumRisk }]} />
              <Text style={[styles.riskLabel, { color: colors.text }]}>
                Medium Risk: {riskDistribution.medium}
              </Text>
            </View>
            <View style={styles.riskStat}>
              <View style={[styles.riskIndicator, { backgroundColor: colors.highRisk }]} />
              <Text style={[styles.riskLabel, { color: colors.text }]}>
                High Risk: {riskDistribution.high}
              </Text>
            </View>
          </View>
        </Card>

        {/* Recent Alerts */}
        <Card style={styles.alertsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Alerts
          </Text>
          {alerts && alerts.length > 0 ? (
            <View style={styles.alertsList}>
              {alerts.slice(0, 3).map((alert) => (
                <View key={alert.patient_id} style={styles.alertItem}>
                  <View style={styles.alertHeader}>
                    <Text style={[styles.alertType, { color: colors.text }]}>
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </Text>
                    <View
                      style={[
                        styles.alertLevel,
                        {
                          backgroundColor: 
                            alert.level === 'urgent' ? colors.error :
                            alert.level === 'warn' ? colors.warning :
                            colors.info,
                        },
                      ]}
                    >
                      <Text style={[styles.alertLevelText, { color: '#FFFFFF' }]}>
                        {alert.level.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.alertSummary, { color: colors.textSecondary }]}>
                    {alert.summary}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noAlerts, { color: colors.textSecondary }]}>
              No recent alerts
            </Text>
          )}
        </Card>
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
  kpisCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  kpisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  kpiItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: 16,
  },
  riskCard: {
    marginBottom: 16,
  },
  riskStats: {
    gap: 8,
  },
  riskStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  riskLabel: {
    fontSize: 14,
  },
  alertsCard: {
    marginBottom: 16,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    gap: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertLevel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertLevelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alertSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  noAlerts: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyIcon: {
    fontSize: 48,
  },
});
