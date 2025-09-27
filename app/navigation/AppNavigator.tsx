import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../providers/SimpleAuthProvider';
import { AuthNavigator } from './AuthNavigator';
import { PatientNavigator } from './PatientNavigator';
import { CareNavigator } from './CareNavigator';
import { LoadingScreen } from '../components/LoadingScreen';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : role === 'patient' ? (
          <Stack.Screen name="Patient" component={PatientNavigator} />
        ) : (
          <Stack.Screen name="Care" component={CareNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
