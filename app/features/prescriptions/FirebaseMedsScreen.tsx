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
import { useTheme } from '../../providers/ThemeProvider';
import { useFirebaseAuth } from '../../providers/FirebaseAuthProvider';
import { useFirebasePrescriptions, useFirebaseUploadPrescription } from './firebaseRx.api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';

export function FirebaseMedsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useFirebaseAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Firebase data hooks
  const { 
    data: prescriptions, 
    isLoading, 
    refetch 
  } = useFirebasePrescriptions(user?.uid || '');
  
  const uploadMutation = useFirebaseUploadPrescription();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUploadPrescription = async () => {
    try {
      // Create a mock FormData for demonstration
      const formData = new FormData();
      formData.append('prescription', 'mock-image-data');
      
      await uploadMutation.mutateAsync(formData);
      Alert.alert('Success', 'Prescription uploaded to Firebase!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload prescription');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading medications from Firebase...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon={<Text style={styles.emptyIcon}>🔥</Text>}
          title="No Medications in Firebase"
          message="Upload your first prescription to get started with Firebase storage."
          actionLabel="Upload Prescription"
          onAction={handleUploadPrescription}
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
        {/* Firebase Status */}
        <Card style={styles.statusCard}>
          <Text style={[styles.statusTitle, { color: colors.primary }]}>
            🔥 Firebase Connected
          </Text>
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            Data is stored in Firestore and synced in real-time
          </Text>
        </Card>

        {/* Medications from Firebase */}
        <Card style={styles.medicationsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Medications (Firebase)
          </Text>
          <View style={styles.medicationsList}>
            {prescriptions.map((rx) => (
              <View key={rx.rx_id} style={styles.medicationItem}>
                <View style={styles.medicationHeader}>
                  <Text style={[styles.medicationName, { color: colors.text }]}>
                    {rx.drug_name}
                  </Text>
                  <Text style={[styles.firebaseBadge, { color: colors.primary }]}>
                    🔥 Firebase
                  </Text>
                </View>
                <Text style={[styles.medicationStrength, { color: colors.textSecondary }]}>
                  {rx.strength} • {rx.dosage_form}
                </Text>
                <Text style={[styles.medicationDirections, { color: colors.textSecondary }]}>
                  {rx.directions_sig}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Upload Button */}
        <Button
          title="Upload New Prescription to Firebase"
          onPress={handleUploadPrescription}
          variant="primary"
          style={styles.uploadButton}
        />
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
  statusCard: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  medicationsCard: {
    marginBottom: 16,
  },
  medicationsList: {
    gap: 16,
  },
  medicationItem: {
    gap: 4,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  firebaseBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  medicationStrength: {
    fontSize: 14,
  },
  medicationDirections: {
    fontSize: 14,
    lineHeight: 20,
  },
  uploadButton: {
    marginTop: 16,
  },
  emptyIcon: {
    fontSize: 48,
  },
});
