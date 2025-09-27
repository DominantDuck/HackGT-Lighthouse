import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/features/auth/useAuth';
import { useCaregiverPatients } from './patients.api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export function PatientListScreen() {
  const { colors, spacing, typography } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const { data: patients, isLoading, refetch } = useCaregiverPatients(user?.id || '');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return colors.lowRisk;
      case 'medium':
        return colors.mediumRisk;
      case 'high':
        return colors.highRisk;
      default:
        return colors.textSecondary;
    }
  };

  const getRiskBadgeStyle = (riskLevel: string) => {
    const color = getRiskColor(riskLevel);
    return {
      backgroundColor: color + '20',
      borderColor: color,
    };
  };

  const getRiskTextColor = (riskLevel: string) => {
    return getRiskColor(riskLevel);
  };

  const formatLastContact = (lastContact?: string) => {
    if (!lastContact) return 'Never';
    
    const date = new Date(lastContact);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRisk === 'all' || patient.risk_level === filterRisk;
    return matchesSearch && matchesFilter;
  }) || [];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading patients...
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
        {/* Search and Filter */}
        <Card style={styles.searchCard}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Search patients..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View style={styles.filterButtons}>
            <Button
              title="All"
              variant={filterRisk === 'all' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setFilterRisk('all')}
            />
            <Button
              title="Low Risk"
              variant={filterRisk === 'low' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setFilterRisk('low')}
            />
            <Button
              title="Medium Risk"
              variant={filterRisk === 'medium' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setFilterRisk('medium')}
            />
            <Button
              title="High Risk"
              variant={filterRisk === 'high' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setFilterRisk('high')}
            />
          </View>
        </Card>

        {/* Patients List */}
        <View style={styles.patientsList}>
          {filteredPatients.map((patient) => (
            <Card key={patient.id} style={styles.patientCard}>
              <TouchableOpacity
                style={styles.patientContent}
                onPress={() => {
                  // Navigate to patient detail
                  console.log('Navigate to patient:', patient.id);
                }}
              >
                <View style={styles.patientHeader}>
                  <View style={styles.patientInfo}>
                    <Text style={[styles.patientName, { color: colors.text }]}>
                      {patient.name}
                    </Text>
                    <Text style={[styles.patientEmail, { color: colors.textSecondary }]}>
                      {patient.email}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.riskBadge,
                      getRiskBadgeStyle(patient.risk_level),
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskText,
                        { color: getRiskTextColor(patient.risk_level) },
                      ]}
                    >
                      {patient.risk_level.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.patientStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {patient.medication_count}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Medications
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {formatLastContact(patient.last_contact)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Last Contact
                    </Text>
                  </View>
                </View>

                <View style={styles.patientActions}>
                  <Button
                    title="View Details"
                    variant="outline"
                    size="small"
                    onPress={() => {
                      // Navigate to patient detail
                      console.log('Navigate to patient detail:', patient.id);
                    }}
                  />
                  <Button
                    title="Message"
                    variant="ghost"
                    size="small"
                    onPress={() => {
                      // Navigate to messaging
                      console.log('Message patient:', patient.id);
                    }}
                  />
                </View>
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {filteredPatients.length === 0 && (
          <Card style={styles.noResultsCard}>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              No patients found matching your criteria.
            </Text>
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
  searchCard: {
    gap: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  patientsList: {
    gap: 12,
  },
  patientCard: {
    marginBottom: 8,
  },
  patientContent: {
    gap: 12,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
    gap: 4,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
  },
  patientEmail: {
    fontSize: 14,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patientStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  patientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noResultsCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 48,
  },
});
