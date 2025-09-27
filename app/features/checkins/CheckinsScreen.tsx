import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/features/auth/useAuth';
import { useCheckIns, useRespondToCheckIn } from './checkins.api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export function CheckinsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [newResponse, setNewResponse] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const { data: checkIns, isLoading, refetch } = useCheckIns(user?.id || '');
  const respondMutation = useRespondToCheckIn();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickResponse = async (checkInId: string, response: string) => {
    try {
      await respondMutation.mutateAsync({
        checkInId,
        response,
      });
      Alert.alert('Response Sent', 'Your response has been recorded.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send response. Please try again.');
    }
  };

  const handleSendResponse = async (checkInId: string) => {
    if (!newResponse.trim()) {
      Alert.alert('Error', 'Please enter a response.');
      return;
    }

    try {
      await respondMutation.mutateAsync({
        checkInId,
        response: newResponse.trim(),
      });
      setNewResponse('');
      setIsComposing(false);
      Alert.alert('Response Sent', 'Your response has been recorded.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send response. Please try again.');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'missed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading check-ins...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!checkIns || checkIns.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>💬</Text>}
          title="No Check-ins"
          message="You don't have any check-ins yet. Your care team will send you messages here."
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
        {checkIns.map((checkIn) => (
          <Card key={checkIn.id} style={styles.checkInCard}>
            <View style={styles.checkInHeader}>
              <Text style={[styles.checkInTime, { color: colors.textSecondary }]}>
                {formatTimestamp(checkIn.timestamp)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(checkIn.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(checkIn.status) },
                  ]}
                >
                  {checkIn.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={[styles.checkInPrompt, { color: colors.text }]}>
              {checkIn.prompt}
            </Text>

            {checkIn.response && (
              <View style={styles.responseSection}>
                <Text style={[styles.responseLabel, { color: colors.textSecondary }]}>
                  Your Response:
                </Text>
                <Text style={[styles.responseText, { color: colors.text }]}>
                  {checkIn.response}
                </Text>
                <Text style={[styles.responseTime, { color: colors.textTertiary }]}>
                  {checkIn.response_timestamp && formatTimestamp(checkIn.response_timestamp)}
                </Text>
              </View>
            )}

            {checkIn.status === 'pending' && (
              <View style={styles.actionSection}>
                <Text style={[styles.actionLabel, { color: colors.text }]}>
                  Quick Reply:
                </Text>
                <View style={styles.quickReplyButtons}>
                  <Button
                    title="Taken"
                    variant="primary"
                    size="small"
                    onPress={() => handleQuickResponse(checkIn.id, 'Taken')}
                  />
                  <Button
                    title="Late"
                    variant="outline"
                    size="small"
                    onPress={() => handleQuickResponse(checkIn.id, 'Late')}
                  />
                  <Button
                    title="Missed"
                    variant="outline"
                    size="small"
                    onPress={() => handleQuickResponse(checkIn.id, 'Missed')}
                  />
                </View>

                {isComposing ? (
                  <View style={styles.composeSection}>
                    <TextInput
                      style={[
                        styles.responseInput,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Type your response..."
                      placeholderTextColor={colors.textTertiary}
                      value={newResponse}
                      onChangeText={setNewResponse}
                      multiline
                      numberOfLines={3}
                    />
                    <View style={styles.composeActions}>
                      <Button
                        title="Cancel"
                        variant="ghost"
                        size="small"
                        onPress={() => {
                          setIsComposing(false);
                          setNewResponse('');
                        }}
                      />
                      <Button
                        title="Send"
                        variant="primary"
                        size="small"
                        onPress={() => handleSendResponse(checkIn.id)}
                      />
                    </View>
                  </View>
                ) : (
                  <Button
                    title="Compose Response"
                    variant="ghost"
                    size="small"
                    onPress={() => setIsComposing(true)}
                  />
                )}
              </View>
            )}
          </Card>
        ))}

        {/* Safety Disclaimer */}
        <Card style={styles.disclaimerCard}>
          <Text style={[styles.disclaimerTitle, { color: colors.warning }]}>
            ⚠️ Safety Notice
          </Text>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            This app is for medication tracking only. If you're experiencing a medical emergency, 
            call 911 or your local emergency number immediately.
          </Text>
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
  checkInCard: {
    gap: 12,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInTime: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkInPrompt: {
    fontSize: 16,
    lineHeight: 24,
  },
  responseSection: {
    gap: 4,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  responseTime: {
    fontSize: 12,
  },
  actionSection: {
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickReplyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  composeSection: {
    gap: 8,
  },
  responseInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  disclaimerCard: {
    marginTop: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyIcon: {
    fontSize: 48,
  },
});
