import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FirebaseFirestoreService } from '../../services/firebaseFirestore';
import { RxStructured, UploadProgress } from '../../types/api';

// Firebase-based prescription API functions
export const firebasePrescriptionApi = {
  uploadPrescription: async (
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<RxStructured> => {
    // For now, we'll simulate the upload process
    // In a real app, you'd upload the image to Firebase Storage first
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) {
          onProgress({
            loaded: progress,
            total: 100,
            percentage: progress
          });
        }
        if (progress >= 100) {
          clearInterval(interval);
          // Mock prescription data - in real app, this would come from image processing
          resolve({
            patient_id: 'user-1',
            rx_id: 'rx-' + Date.now(),
            drug_name: 'Mock Drug from Firebase',
            strength: '10mg',
            dosage_form: 'tablet',
            directions_sig: 'Take once daily',
            schedule: [{
              time_window: '08:00',
              amount: 1,
              unit: 'pill',
              with_food: false
            }],
            start_date: new Date().toISOString().split('T')[0],
            end_date: null,
            prn: false,
            warnings: ['Take with food'],
            prescriber: 'Dr. Smith',
            pharmacy: 'CVS Pharmacy',
            refills_remaining: 3
          });
        }
      }, 100);
    });
  },

  getPrescriptions: async (patientId: string): Promise<RxStructured[]> => {
    return FirebaseFirestoreService.getPrescriptions(patientId);
  },

  getPrescription: async (rxId: string): Promise<RxStructured> => {
    // This would need to be implemented in FirebaseFirestoreService
    throw new Error('getPrescription not implemented yet');
  },

  updatePrescription: async (rxId: string, updates: Partial<RxStructured>): Promise<RxStructured> => {
    await FirebaseFirestoreService.updatePrescription(rxId, updates);
    // Return updated prescription
    return { ...updates, rx_id: rxId } as RxStructured;
  },

  deletePrescription: async (rxId: string): Promise<void> => {
    return FirebaseFirestoreService.deletePrescription(rxId);
  },
};

// React Query hooks for Firebase
export const useFirebaseUploadPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => firebasePrescriptionApi.uploadPrescription(formData),
    onSuccess: (data) => {
      // Add the new prescription to Firestore
      FirebaseFirestoreService.addPrescription(data);
      // Invalidate prescriptions cache
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (error) => {
      console.error('Firebase prescription upload failed:', error);
    },
  });
};

export const useFirebasePrescriptions = (patientId: string) => {
  return useQuery({
    queryKey: ['firebase-prescriptions', patientId],
    queryFn: () => firebasePrescriptionApi.getPrescriptions(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useFirebaseUpdatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rxId, updates }: { rxId: string; updates: Partial<RxStructured> }) =>
      firebasePrescriptionApi.updatePrescription(rxId, updates),
    onSuccess: (data, variables) => {
      // Update the specific prescription in cache
      queryClient.setQueryData(['firebase-prescriptions', data.patient_id], (old: any) => {
        if (!old) return old;
        return old.map((prescription: RxStructured) => 
          prescription.rx_id === variables.rxId 
            ? { ...prescription, ...variables.updates }
            : prescription
        );
      });
    },
    onError: (error) => {
      console.error('Firebase prescription update failed:', error);
    },
  });
};

export const useFirebaseDeletePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: firebasePrescriptionApi.deletePrescription,
    onSuccess: (_, rxId) => {
      // Remove from cache
      queryClient.setQueryData(['firebase-prescriptions'], (old: any) => {
        if (!old) return old;
        return old.filter((prescription: RxStructured) => prescription.rx_id !== rxId);
      });
    },
    onError: (error) => {
      console.error('Firebase prescription deletion failed:', error);
    },
  });
};
