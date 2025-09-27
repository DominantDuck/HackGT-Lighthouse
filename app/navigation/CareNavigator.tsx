import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

// Import screens (these will be created)
import { CareDashboardScreen } from '@/features/patients/CareDashboardScreen';
import { PatientListScreen } from '@/features/patients/PatientListScreen';
import { AlertsScreen } from '@/features/alerts/AlertsScreen';
import { ReportsScreen } from '@/features/reports/ReportsScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CareTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Patients':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Alerts':
              iconName = focused ? 'warning' : 'warning-outline';
              break;
            case 'Reports':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={CareDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Patients" 
        component={PatientListScreen}
        options={{ title: 'Patients' }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen}
        options={{ title: 'Alerts' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export function CareNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CareTabs" component={CareTabs} />
      {/* Add modal screens here */}
    </Stack.Navigator>
  );
}
