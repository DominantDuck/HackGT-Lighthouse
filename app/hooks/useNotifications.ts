import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useSessionStore } from '../store/session';
import { RxStructured } from '../../types/api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const { user, isAuthenticated } = useSessionStore();

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      console.warn('Must use physical device for push notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Push token:', token.data);
      
      // TODO: Send token to backend
      // await apiClient.post('/notifications/register', { token: token.data });
      
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }, []);

  // Schedule local notifications for medication doses
  const scheduleDoseNotifications = useCallback(async (prescriptions: RxStructured[]) => {
    if (!prescriptions || prescriptions.length === 0) return;

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const rx of prescriptions) {
      for (const dose of rx.schedule) {
        const [hours, minutes] = dose.time_window.split(':').map(Number);
        
        // Create notification for each day of the week
        const daysOfWeek = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday
        
        for (const dayOfWeek of daysOfWeek) {
          const notificationId = `${rx.rx_id}-${dose.time_window}-${dayOfWeek}`;
          
          await Notifications.scheduleNotificationAsync({
            identifier: notificationId,
            content: {
              title: '💊 Time for your medication',
              body: `It's time to take ${dose.amount} ${dose.unit} of ${rx.drug_name}${dose.with_food ? ' with food' : ''}`,
              data: {
                rxId: rx.rx_id,
                drugName: rx.drug_name,
                dose: dose,
                type: 'dose_reminder',
              },
            },
            trigger: {
              weekday: dayOfWeek + 1, // expo-notifications uses 1-7 (Sunday = 1)
              hour: hours,
              minute: minutes,
              repeats: true,
            },
          });
        }
      }
    }
  }, []);

  // Schedule check-in reminders
  const scheduleCheckInReminders = useCallback(async () => {
    // Cancel existing check-in notifications
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const checkInNotifications = allNotifications.filter(n => n.content.data?.type === 'check_in_reminder');
    
    for (const notification of checkInNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    // Schedule daily check-in reminder at 6 PM
    await Notifications.scheduleNotificationAsync({
      identifier: 'check-in-reminder',
      content: {
        title: '📝 Daily Check-in',
        body: 'Don\'t forget to check in with your care team today',
        data: {
          type: 'check_in_reminder',
        },
      },
      trigger: {
        hour: 18,
        minute: 0,
        repeats: true,
      },
    });
  }, []);

  // Handle notification interactions
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'dose_reminder') {
      // Navigate to home screen or show dose logging interface
      console.log('Dose reminder tapped:', data);
    } else if (data?.type === 'check_in_reminder') {
      // Navigate to check-ins screen
      console.log('Check-in reminder tapped:', data);
    }
  }, []);

  // Test notification
  const sendTestNotification = useCallback(async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from the Medication Monitoring app',
        data: { type: 'test' },
      },
      trigger: { seconds: 1 },
    });
  }, []);

  // Initialize notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Register for push notifications
    registerForPushNotifications();

    // Set up notification response listener
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, user, registerForPushNotifications, handleNotificationResponse]);

  return {
    registerForPushNotifications,
    scheduleDoseNotifications,
    scheduleCheckInReminders,
    sendTestNotification,
  };
}
