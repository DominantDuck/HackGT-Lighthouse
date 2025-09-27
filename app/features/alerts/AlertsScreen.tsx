import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/features/auth/useAuth';
import { useAlerts, useMarkAlertReviewed, useEscalateAlert, useDismissAlert } from './alerts.api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export function AlertsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: alerts, isLoading, refetch } = useAlerts(user?.id || '');
  const markReviewedMutation = useMarkAlertReviewed();
  const escalateMutation = useEscalateAlert();
  const dismissMutation = useDismissAlert();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'urgent':
        return colors.error;
      case 'warn':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'repeated_miss':
        return '⚠️';
      case 'overdose_risk':
        return '🚨';
      case 'side_effect':
        return '💊';
      case 'dose_change_suspected':
        return '📊';
      default:
        return 'ℹ️';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMarkReviewed = async (alertId: string) => {
    try {
      await markReviewedMutation.mutateAsync(alertId);
      Alert.alert('Success', 'Alert marked as reviewed.');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark alert as reviewed.');
    }
  };

  const handleEscalate = async (alertId: string) => {
    Alert.prompt(
      'Escalate Alert',
      'Please provide a reason for escalation:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          onPress: async (reason) => {
            if (!reason?.trim()) {
              Alert.alert('Error', 'Please provide a reason for escalation.');
              return;
            }
            try {
              await escalateMutation.mutateAsync({ alertId, reason: reason.trim() });
              Alert.alert('Success', 'Alert has been escalated.');
            } catch (error) {
              Alert.alert('Error', 'Failed to escalate alert.');
            }
          },
        },
      ]
    );
  };

  const handleDismiss = async (alertId: string) => {
    Alert.alert(
      'Dismiss Alert',
      'Are you sure you want to dismiss this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: async () => {
            try {
              await dismissMutation.mutateAsync(alertId);
              Alert.alert('Success', 'Alert has been dismissed.');
            } catch (error) {
              Alert.alert('Error', 'Failed to dismiss alert.');
            }
          },
        },
      ]
    );
  };

  const groupedAlerts = alerts?.reduce((groups, alert) => {
    const level = alert.level;
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(alert);
    return groups;
  }, {} as Record<string, any[]>) || {};

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading alerts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>🔔</Text>}
          title="No Alerts"
          message="You don't have any alerts at the moment. Great job keeping your patients on track!"
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
        {/* Alert Summary */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Alert Summary
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {groupedAlerts.urgent?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Urgent
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {groupedAlerts.warn?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Warnings
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.statValue, { color: colors.info }]}>
                {groupedAlerts.info?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Info
              </Text>
            </View>
          </View>
        </Card>

        {/* Alerts by Level */}
        {Object.entries(groupedAlerts).map(([level, levelAlerts]) => (
          <Card key={level} style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelInfo}>
                <Text style={[styles.levelTitle, { color: colors.text }]}>
                  {level.toUpperCase()} ALERTS
                </Text>
                <Text style={[styles.levelCount, { color: colors.textSecondary }]}>
                  {levelAlerts.length} alert{levelAlerts.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View
                style={[
                  styles.levelIndicator,
                  { backgroundColor: getAlertLevelColor(level) },
                ]}
              />
            </View>

            <View style={styles.alertsList}>
              {levelAlerts.map((alert) => (
                <Card key={alert.patient_id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertInfo}>
                      <Text style={[styles.alertType, { color: colors.text }]}>
                        {getAlertTypeIcon(alert.type)} {alert.type.replace('_', ' ').toUpperCase()}
                      </Text>
                      <Text style={[styles.alertTime, { color: colors.textSecondary }]}>
                        {formatTimestamp(alert.patient_id)} {/* Using patient_id as timestamp placeholder */}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.alertLevelBadge,
                        { backgroundColor: getAlertLevelColor(alert.level) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.alertLevelText,
                          { color: getAlertLevelColor(alert.level) },
                        ]}
                      >
                        {alert.level.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.alertSummary, { color: colors.text }]}>
                    {alert.summary}
                  </Text>

                  <Text style={[styles.alertAction, { color: colors.textSecondary }]}>
                    Recommended: {alert.recommended_action}
                  </Text>

                  <View style={styles.alertActions}>
                    <Button
                      title="Mark Reviewed"
                      variant="primary"
                      size="small"
                      onPress={() => handleMarkReviewed(alert.patient_id)}
                      loading={markReviewedMutation.isPending}
                    />
                    <Button
                      title="Escalate"
                      variant="outline"
                      size="small"
                      onPress={() => handleEscalate(alert.patient_id)}
                      loading={escalateMutation.isPending}
                    />
                    <Button
                      title="Dismiss"
                      variant="ghost"
                      size="small"
                      onPress={() => handleDismiss(alert.patient_id)}
                      loading={dismissMutation.isPending}
                    />
                  </View>
                </Card>
              ))}
            </View>
          </Card>
        ))}
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
  summaryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  levelCard: {
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelInfo: {
    gap: 4,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  levelCount: {
    fontSize: 14,
  },
  levelIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    gap: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertInfo: {
    flex: 1,
    gap: 4,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertTime: {
    fontSize: 12,
  },
  alertLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  alertAction: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  emptyIcon: {
    fontSize: 48,
  },
});
