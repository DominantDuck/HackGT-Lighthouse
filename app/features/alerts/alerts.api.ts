import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Alert } from '@/types/api';
import { FirebaseFirestoreService } from '@/services/firebaseFirestore';

// Alerts API functions - Now using Firebase
export const alertsApi = {
  getAlerts: async (patientId: string): Promise<Alert[]> => {
    return FirebaseFirestoreService.getAlerts(patientId);
  },

  getAlert: async (alertId: string): Promise<Alert> => {
    // For now, return a mock alert
    // In a real app, you'd fetch from Firebase by ID
    return {
      id: alertId,
      patient_id: 'user-1',
      level: 'warn',
      type: 'repeated_miss',
      summary: 'Missed 3 doses this week',
      recommended_action: 'Contact patient to discuss adherence',
      created_at: new Date().toISOString()
    };
  },

  markAlertReviewed: async (alertId: string): Promise<void> => {
    // This would update the alert status in Firebase
    console.log(`Marking alert ${alertId} as reviewed`);
  },

  escalateAlert: async (alertId: string, reason: string): Promise<void> => {
    // This would escalate the alert in Firebase
    console.log(`Escalating alert ${alertId} with reason: ${reason}`);
  },

  dismissAlert: async (alertId: string): Promise<void> => {
    // This would dismiss the alert in Firebase
    console.log(`Dismissing alert ${alertId}`);
  },
};

// React Query hooks
export const useAlerts = (patientId: string) => {
  return useQuery({
    queryKey: ['alerts', patientId],
    queryFn: () => alertsApi.getAlerts(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useAlert = (alertId: string) => {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: () => alertsApi.getAlert(alertId),
    enabled: !!alertId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMarkAlertReviewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertsApi.markAlertReviewed,
    onSuccess: (_, alertId) => {
      // Remove the alert from cache
      queryClient.removeQueries({ queryKey: ['alert', alertId] });
      // Invalidate alerts list
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (error) => {
      console.error('Mark alert reviewed failed:', error);
    },
  });
};

export const useEscalateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, reason }: { alertId: string; reason: string }) =>
      alertsApi.escalateAlert(alertId, reason),
    onSuccess: (_, variables) => {
      // Remove the alert from cache
      queryClient.removeQueries({ queryKey: ['alert', variables.alertId] });
      // Invalidate alerts list
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (error) => {
      console.error('Alert escalation failed:', error);
    },
  });
};

export const useDismissAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alertsApi.dismissAlert,
    onSuccess: (_, alertId) => {
      // Remove the alert from cache
      queryClient.removeQueries({ queryKey: ['alert', alertId] });
      // Invalidate alerts list
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (error) => {
      console.error('Alert dismissal failed:', error);
    },
  });
};
