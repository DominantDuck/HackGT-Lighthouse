import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/features/auth/useAuth';
import { usePrescriptions, useUploadPrescription } from './rx.api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { UploadTile } from '@/components/UploadTile';
import { EmptyState } from '@/components/EmptyState';

export function MedsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: prescriptions, isLoading, refetch } = usePrescriptions(user?.id || '');
  const uploadMutation = useUploadPrescription();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleImageSelected = (uri: string) => {
    console.log('Image selected:', uri);
  };

  const handleImageProcessed = async (uri: string) => {
    setIsUploading(true);
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'prescription.jpg',
      } as any);

      const result = await uploadMutation.mutateAsync(formData);
      Alert.alert(
        'Success',
        'Prescription uploaded successfully! Please review the details.',
        [
          {
            text: 'Review',
            onPress: () => {
              // Navigate to review screen
              console.log('Navigate to review screen with:', result);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTestReminder = (rxId: string) => {
    Alert.alert(
      'Test Reminder',
      'This would schedule a test notification for this medication.',
      [{ text: 'OK' }]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading medications...
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
        {/* Upload Section */}
        <Card style={styles.uploadCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Add New Prescription
          </Text>
          <UploadTile
            onImageSelected={handleImageSelected}
            onImageProcessed={handleImageProcessed}
            style={styles.uploadTile}
          />
        </Card>

        {/* Current Medications */}
        {!prescriptions || prescriptions.length === 0 ? (
          <EmptyState
            icon={<Text style={styles.emptyIcon}>💊</Text>}
            title="No Medications"
            message="Upload your first prescription to get started with medication tracking."
            actionLabel="Upload Prescription"
            onAction={() => {
              // Focus on upload section
            }}
          />
        ) : (
          <Card style={styles.medicationsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Medications ({prescriptions.length})
            </Text>
            <View style={styles.medicationsList}>
              {prescriptions.map((rx) => (
                <Card key={rx.rx_id} style={styles.medicationCard}>
                  <View style={styles.medicationHeader}>
                    <View style={styles.medicationInfo}>
                      <Text style={[styles.medicationName, { color: colors.text }]}>
                        {rx.drug_name}
                      </Text>
                      <Text style={[styles.medicationStrength, { color: colors.textSecondary }]}>
                        {rx.strength} • {rx.dosage_form}
                      </Text>
                      <Text style={[styles.medicationDirections, { color: colors.textSecondary }]}>
                        {rx.directions_sig}
                      </Text>
                    </View>
                    <View style={styles.medicationActions}>
                      <Button
                        title="Test Reminder"
                        variant="ghost"
                        size="small"
                        onPress={() => handleTestReminder(rx.rx_id)}
                      />
                    </View>
                  </View>

                  {/* Schedule */}
                  <View style={styles.scheduleSection}>
                    <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                      Schedule
                    </Text>
                    <View style={styles.scheduleList}>
                      {rx.schedule.map((dose, index) => (
                        <View key={index} style={styles.scheduleItem}>
                          <Text style={[styles.scheduleTime, { color: colors.text }]}>
                            {dose.time_window}
                          </Text>
                          <Text style={[styles.scheduleAmount, { color: colors.textSecondary }]}>
                            {dose.amount} {dose.unit}
                            {dose.with_food && ' with food'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Warnings */}
                  {rx.warnings.length > 0 && (
                    <View style={styles.warningsSection}>
                      <Text style={[styles.warningsTitle, { color: colors.warning }]}>
                        Warnings
                      </Text>
                      {rx.warnings.map((warning, index) => (
                        <Text key={index} style={[styles.warningText, { color: colors.textSecondary }]}>
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Prescriber Info */}
                  {(rx.prescriber || rx.pharmacy) && (
                    <View style={styles.prescriberSection}>
                      {rx.prescriber && (
                        <Text style={[styles.prescriberText, { color: colors.textSecondary }]}>
                          Prescriber: {rx.prescriber}
                        </Text>
                      )}
                      {rx.pharmacy && (
                        <Text style={[styles.prescriberText, { color: colors.textSecondary }]}>
                          Pharmacy: {rx.pharmacy}
                        </Text>
                      )}
                    </View>
                  )}
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
  uploadCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  uploadTile: {
    marginTop: 8,
  },
  medicationsCard: {
    marginBottom: 16,
  },
  medicationsList: {
    gap: 16,
  },
  medicationCard: {
    gap: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicationInfo: {
    flex: 1,
    gap: 4,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
  },
  medicationStrength: {
    fontSize: 14,
  },
  medicationDirections: {
    fontSize: 14,
    lineHeight: 20,
  },
  medicationActions: {
    gap: 8,
  },
  scheduleSection: {
    gap: 8,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleList: {
    gap: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleAmount: {
    fontSize: 14,
  },
  warningsSection: {
    gap: 4,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  prescriberSection: {
    gap: 4,
  },
  prescriberText: {
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 48,
  },
});
