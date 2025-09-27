import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../auth/useAuth';
import { useLogout } from '../auth/auth.api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function SettingsScreen() {
  const { colors, spacing, typography, theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const logoutMutation = useLogout();

  // Notification preferences state
  const [doseReminders, setDoseReminders] = useState(true);
  const [checkInReminders, setCheckInReminders] = useState(true);
  const [alertNotifications, setAlertNotifications] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  // Accessibility preferences state
  const [highContrast, setHighContrast] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete Local Data',
      'This will delete all locally stored data including your medications and check-ins. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement data deletion
            Alert.alert('Data Deleted', 'All local data has been deleted.');
          },
        },
      ]
    );
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>
          <View style={styles.accountInfo}>
            <Text style={[styles.accountName, { color: colors.text }]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
              {user?.email}
            </Text>
            <Text style={[styles.accountRole, { color: colors.primary }]}>
              {user?.role === 'patient' ? 'Patient' : 'Caregiver'}
            </Text>
          </View>
        </Card>

        {/* Appearance Section */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          <View style={styles.themeOptions}>
            <Button
              title="Light"
              variant={theme === 'light' ? 'primary' : 'outline'}
              size="small"
              onPress={() => handleThemeChange('light')}
            />
            <Button
              title="Dark"
              variant={theme === 'dark' ? 'primary' : 'outline'}
              size="small"
              onPress={() => handleThemeChange('dark')}
            />
            <Button
              title="System"
              variant={theme === 'system' ? 'primary' : 'outline'}
              size="small"
              onPress={() => handleThemeChange('system')}
            />
          </View>
        </Card>

        {/* Notifications Section */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Dose Reminders
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get notified when it's time to take your medication
              </Text>
            </View>
            <Switch
              value={doseReminders}
              onValueChange={setDoseReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={doseReminders ? '#FFFFFF' : colors.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Check-in Reminders
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Reminders to respond to care team messages
              </Text>
            </View>
            <Switch
              value={checkInReminders}
              onValueChange={setCheckInReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={checkInReminders ? '#FFFFFF' : colors.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Alert Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Notifications for important alerts and warnings
              </Text>
            </View>
            <Switch
              value={alertNotifications}
              onValueChange={setAlertNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={alertNotifications ? '#FFFFFF' : colors.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={pushEnabled ? '#FFFFFF' : colors.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Email Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={emailEnabled ? '#FFFFFF' : colors.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                SMS Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive notifications via text message
              </Text>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={smsEnabled ? '#FFFFFF' : colors.textTertiary}
            />
          </View>
        </Card>

        {/* Accessibility Section */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Accessibility
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                High Contrast
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Increase contrast for better visibility
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={highContrast ? '#FFFFFF' : colors.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Haptic Feedback
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Vibration feedback for interactions
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={hapticsEnabled ? '#FFFFFF' : colors.textTertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Reduced Motion
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Minimize animations and transitions
              </Text>
            </View>
            <Switch
              value={reducedMotion}
              onValueChange={setReducedMotion}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={reducedMotion ? '#FFFFFF' : colors.textTertiary}
            />
          </View>
        </Card>

        {/* Data Section */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data & Privacy
          </Text>
          
          <Button
            title="Delete Local Data"
            variant="outline"
            onPress={handleDeleteData}
            style={styles.dataButton}
          />
        </Card>

        {/* Sign Out Section */}
        <Card style={styles.sectionCard}>
          <Button
            title="Sign Out"
            variant="danger"
            onPress={handleLogout}
            loading={logoutMutation.isPending}
            disabled={logoutMutation.isPending}
            fullWidth
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionCard: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  accountInfo: {
    gap: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountEmail: {
    fontSize: 14,
  },
  accountRole: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  dataButton: {
    alignSelf: 'flex-start',
  },
});
