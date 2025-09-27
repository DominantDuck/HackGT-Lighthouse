import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { CheckIn } from '@/types/api';
import { FirebaseFirestoreService } from '@/services/firebaseFirestore';

// Check-ins API functions - Now using Firebase
export const checkinsApi = {
  getCheckIns: async (patientId: string): Promise<CheckIn[]> => {
    return FirebaseFirestoreService.getCheckins(patientId);
  },

  getCheckIn: async (checkInId: string): Promise<CheckIn> => {
    // For now, return a mock check-in
    // In a real app, you'd fetch from Firebase by ID
    return {
      id: checkInId,
      patient_id: 'user-1',
      type: 'scheduled',
      prompt: 'How are you feeling today?',
      response: null,
      status: 'pending',
      created_at: new Date().toISOString()
    };
  },

  respondToCheckIn: async (checkInId: string, response: string): Promise<CheckIn> => {
    await FirebaseFirestoreService.respondToCheckin(checkInId, response);
    return {
      id: checkInId,
      patient_id: 'user-1',
      type: 'scheduled',
      prompt: 'How are you feeling today?',
      response,
      status: 'completed',
      created_at: new Date().toISOString()
    };
  },

  queueCheckIn: async (patientId: string, message: string): Promise<{ id: string }> => {
    // For now, return a mock ID
    // In a real app, you'd create a new check-in in Firebase
    return { id: `checkin-${Date.now()}` };
  },

  markCheckInCompleted: async (checkInId: string): Promise<void> => {
    // This would update the check-in status in Firebase
    console.log(`Marking check-in ${checkInId} as completed`);
  },
};

// React Query hooks
export const useCheckIns = (patientId: string) => {
  return useQuery({
    queryKey: ['checkins', patientId],
    queryFn: () => checkinsApi.getCheckIns(patientId),
    enabled: !!patientId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCheckIn = (checkInId: string) => {
  return useQuery({
    queryKey: ['checkin', checkInId],
    queryFn: () => checkinsApi.getCheckIn(checkInId),
    enabled: !!checkInId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRespondToCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checkInId, response }: { checkInId: string; response: string }) =>
      checkinsApi.respondToCheckIn(checkInId, response),
    onSuccess: (data) => {
      // Update the specific check-in in cache
      queryClient.setQueryData(['checkin', data.id], data);
      // Invalidate check-ins list
      queryClient.invalidateQueries({ queryKey: ['checkins', data.patient_id] });
    },
    onError: (error) => {
      console.error('Check-in response failed:', error);
    },
  });
};

export const useQueueCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, message }: { patientId: string; message: string }) =>
      checkinsApi.queueCheckIn(patientId, message),
    onSuccess: (_, variables) => {
      // Invalidate check-ins for the patient
      queryClient.invalidateQueries({ queryKey: ['checkins', variables.patientId] });
    },
    onError: (error) => {
      console.error('Check-in queue failed:', error);
    },
  });
};

export const useMarkCheckInCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkinsApi.markCheckInCompleted,
    onSuccess: (_, checkInId) => {
      // Update the check-in status in cache
      queryClient.setQueryData(['checkin', checkInId], (old: CheckIn) => ({
        ...old,
        status: 'completed' as const,
      }));
      // Invalidate check-ins list
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
    },
    onError: (error) => {
      console.error('Mark check-in completed failed:', error);
    },
  });
};
