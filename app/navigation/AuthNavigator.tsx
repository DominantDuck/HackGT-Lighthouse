import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '@/features/auth/LoginScreen';

const Stack = createStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
