import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

// Import screens (these will be created)
import { MedsScreen } from '@/features/prescriptions/MedsScreen';
import { CheckinsScreen } from '@/features/checkins/CheckinsScreen';
import { ReportsScreen } from '@/features/reports/ReportsScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PatientTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Checkins"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Checkins':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Meds':
              iconName = focused ? 'medical' : 'medical-outline';
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
        name="Checkins" 
        component={CheckinsScreen}
        options={{ title: 'Check-ins' }}
      />
      <Tab.Screen 
        name="Meds" 
        component={MedsScreen}
        options={{ title: 'Medications' }}
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

export function PatientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
      {/* Add modal screens here */}
    </Stack.Navigator>
  );
}
