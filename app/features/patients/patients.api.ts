import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Patient, Caregiver } from '@/types/api';
import { useSessionStore } from '@/store/session';

// Patients API functions
export const patientsApi = {
  getMe: async (): Promise<Patient> => {
    return apiClient.get<Patient>('/patients/me');
  },

  getCaregiverPatients: async (caregiverId: string): Promise<Patient[]> => {
    return apiClient.get<Patient[]>(`/care/${caregiverId}/patients`);
  },

  getPatient: async (patientId: string): Promise<Patient> => {
    return apiClient.get<Patient>(`/patients/${patientId}`);
  },

  updatePatient: async (patientId: string, updates: Partial<Patient>): Promise<Patient> => {
    return apiClient.put<Patient>(`/patients/${patientId}`, updates);
  },

  getCaregiverProfile: async (caregiverId: string): Promise<Caregiver> => {
    return apiClient.get<Caregiver>(`/caregivers/${caregiverId}`);
  },
};

// React Query hooks
export const useMe = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['patient', 'me'],
    queryFn: patientsApi.getMe,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCaregiverPatients = (caregiverId: string) => {
  return useQuery({
    queryKey: ['patients', 'caregiver', caregiverId],
    queryFn: () => patientsApi.getCaregiverPatients(caregiverId),
    enabled: !!caregiverId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePatient = (patientId: string) => {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientsApi.getPatient(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, updates }: { patientId: string; updates: Partial<Patient> }) =>
      patientsApi.updatePatient(patientId, updates),
    onSuccess: (data, variables) => {
      // Update the specific patient in cache
      queryClient.setQueryData(['patient', variables.patientId], data);
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error('Patient update failed:', error);
    },
  });
};

export const useCaregiverProfile = (caregiverId: string) => {
  return useQuery({
    queryKey: ['caregiver', caregiverId],
    queryFn: () => patientsApi.getCaregiverProfile(caregiverId),
    enabled: !!caregiverId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
