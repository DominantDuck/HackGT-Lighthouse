import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/SimpleAuthProvider';
import { useLogin } from './auth.api';
import { FirebaseAuthService } from '@/services/firebaseAuth';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export function LoginScreen() {
  const { colors, spacing, typography } = useTheme();
  const { login } = useAuth();
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      
      await login(result.token, result.user);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await FirebaseAuthService.signUp(email.trim(), password);
      Alert.alert(
        'Success', 
        'Account created successfully! Please check your email to verify your account.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Sign Up Failed',
        error.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSwitch = (role: 'patient' | 'care') => {
    // This would typically be handled by the backend
    // For now, we'll show an alert
    Alert.alert(
      'Role Selection',
      `You have access to both patient and caregiver roles. Please contact support to set your primary role.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Medication Monitoring
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to manage your medications
            </Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Password
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                style={styles.loginButton}
              />

              <Button
                title="Create Account"
                onPress={handleSignUp}
                loading={isLoading}
                disabled={isLoading}
                variant="outline"
                fullWidth
                style={styles.signUpButton}
              />
            </View>
          </Card>

          <View style={styles.roleSwitch}>
            <Text style={[styles.roleText, { color: colors.textSecondary }]}>
              Have multiple roles?
            </Text>
            <Button
              title="Switch Role"
              variant="ghost"
              size="small"
              onPress={() => handleRoleSwitch('patient')}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Need help? Contact support
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  loginButton: {
    marginTop: 8,
  },
  signUpButton: {
    marginTop: 12,
  },
  roleSwitch: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  roleText: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
