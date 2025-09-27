import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { AdherenceStatus, IntakeEvent } from '@/types/api';
import { FirebaseFirestoreService } from '@/services/firebaseFirestore';

// Adherence API functions - Now using Firebase
export const adherenceApi = {
  getAdherence: async (patientId: string): Promise<AdherenceStatus[]> => {
    return FirebaseFirestoreService.getAdherence(patientId);
  },

  logIntake: async (intakeEvent: Omit<IntakeEvent, 'timestamp'>): Promise<IntakeEvent> => {
    const fullIntakeEvent: IntakeEvent = {
      ...intakeEvent,
      timestamp: new Date().toISOString()
    };
    
    // Store intake event in Firebase
    await FirebaseFirestoreService.addIntakeEvent(fullIntakeEvent);
    return fullIntakeEvent;
  },

  getIntakeHistory: async (patientId: string, rxId?: string): Promise<IntakeEvent[]> => {
    return FirebaseFirestoreService.getIntakeHistory(patientId, rxId);
  },
};

// React Query hooks
export const useAdherence = (patientId: string) => {
  return useQuery({
    queryKey: ['adherence', patientId],
    queryFn: () => adherenceApi.getAdherence(patientId),
    enabled: !!patientId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useLogIntake = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adherenceApi.logIntake,
    onSuccess: (data) => {
      // Invalidate adherence data
      queryClient.invalidateQueries({ queryKey: ['adherence', data.patient_id] });
      // Invalidate intake history
      queryClient.invalidateQueries({ queryKey: ['intake-history', data.patient_id] });
    },
    onError: (error) => {
      console.error('Intake logging failed:', error);
    },
  });
};

export const useIntakeHistory = (patientId: string, rxId?: string) => {
  return useQuery({
    queryKey: ['intake-history', patientId, rxId],
    queryFn: () => adherenceApi.getIntakeHistory(patientId, rxId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
