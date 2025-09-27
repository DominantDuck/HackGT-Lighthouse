import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { RxStructured, UploadProgress } from '@/types/api';
import { FirebaseFirestoreService } from '@/services/firebaseFirestore';

// Prescription API functions - Now using Firebase
export const prescriptionApi = {
  uploadPrescription: async (
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<RxStructured> => {
    // For now, create a mock prescription from form data
    // In a real app, you'd process the form data and extract prescription info
    const mockPrescription: RxStructured = {
      rx_id: `rx-${Date.now()}`,
      patient_id: 'user-1', // This should come from the authenticated user
      drug_name: 'Sample Medication',
      strength: '10mg',
      dosage_form: 'tablet',
      directions_sig: 'Take as directed',
      schedule: [{
        time_window: '08:00',
        amount: 1,
        unit: 'pill',
        with_food: false
      }],
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      prn: false,
      warnings: [],
      prescriber: 'Dr. Sample',
      pharmacy: 'Sample Pharmacy',
      refills_remaining: 3
    };

    // Store in Firebase
    const docId = await FirebaseFirestoreService.addPrescription(mockPrescription);
    return { ...mockPrescription, rx_id: docId };
  },

  getPrescriptions: async (patientId: string): Promise<RxStructured[]> => {
    return FirebaseFirestoreService.getPrescriptions(patientId);
  },

  getPrescription: async (rxId: string): Promise<RxStructured> => {
    return FirebaseFirestoreService.getPrescription(rxId);
  },

  updatePrescription: async (rxId: string, updates: Partial<RxStructured>): Promise<RxStructured> => {
    return FirebaseFirestoreService.updatePrescription(rxId, updates);
  },

  deletePrescription: async (rxId: string): Promise<void> => {
    return FirebaseFirestoreService.deletePrescription(rxId);
  },
};

// React Query hooks
export const useUploadPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => prescriptionApi.uploadPrescription(formData),
    onSuccess: () => {
      // Invalidate prescriptions cache
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (error) => {
      console.error('Prescription upload failed:', error);
    },
  });
};

export const usePrescriptions = (patientId: string) => {
  return useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: () => prescriptionApi.getPrescriptions(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePrescription = (rxId: string) => {
  return useQuery({
    queryKey: ['prescription', rxId],
    queryFn: () => prescriptionApi.getPrescription(rxId),
    enabled: !!rxId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rxId, updates }: { rxId: string; updates: Partial<RxStructured> }) =>
      prescriptionApi.updatePrescription(rxId, updates),
    onSuccess: (data, variables) => {
      // Update the specific prescription in cache
      queryClient.setQueryData(['prescription', variables.rxId], data);
      // Invalidate prescriptions list
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (error) => {
      console.error('Prescription update failed:', error);
    },
  });
};

export const useDeletePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: prescriptionApi.deletePrescription,
    onSuccess: (_, rxId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['prescription', rxId] });
      // Invalidate prescriptions list
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (error) => {
      console.error('Prescription deletion failed:', error);
    },
  });
};
