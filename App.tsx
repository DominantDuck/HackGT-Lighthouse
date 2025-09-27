import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import QueryProvider from './app/providers/QueryProvider';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { SimpleAuthProvider } from './app/providers/SimpleAuthProvider';
import { AppNavigator } from './app/navigation/AppNavigator';
import { useNetInfoSync } from './app/hooks/useNetInfoSync';
import { useNotifications } from './app/hooks/useNotifications';

function AppContent() {
  // Initialize offline sync
  useNetInfoSync();
  
  // Initialize notifications
  useNotifications();

  return <AppNavigator />;
}

export default function App() {
  return (
        <SafeAreaProvider>
          <QueryProvider>
            <ThemeProvider>
              <SimpleAuthProvider>
                <StatusBar style="auto" />
                <AppContent />
              </SimpleAuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </SafeAreaProvider>
  );
}
