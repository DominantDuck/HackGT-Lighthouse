import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { WeeklyReport } from '@/types/api';
import { FirebaseFirestoreService } from '@/services/firebaseFirestore';

// Reports API functions - Now using Firebase
export const reportsApi = {
  getReports: async (patientId: string): Promise<WeeklyReport[]> => {
    return FirebaseFirestoreService.getReports(patientId);
  },

  getReport: async (reportId: string): Promise<WeeklyReport> => {
    // For now, return a mock report
    // In a real app, you'd fetch from Firebase by ID
    return {
      id: reportId,
      patient_id: 'user-1',
      week_start: '2024-01-15',
      week_end: '2024-01-21',
      url: 'https://example.com/reports/weekly-report.pdf',
      generated_at: new Date().toISOString(),
      summary: {
        adherence_rate: 85.5,
        missed_doses: 1,
        side_effects_reported: 0,
        risk_factors: ['Missed morning dose']
      }
    };
  },

  generateReport: async (patientId: string): Promise<{ url: string; reportId: string }> => {
    const reportData = {
      patient_id: patientId,
      week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      week_end: new Date().toISOString().split('T')[0],
      url: 'https://example.com/reports/weekly-report.pdf',
      generated_at: new Date().toISOString(),
      summary: {
        adherence_rate: 85.5,
        missed_doses: 1,
        side_effects_reported: 0,
        risk_factors: ['Missed morning dose']
      }
    };
    
    const reportId = await FirebaseFirestoreService.generateReport(patientId, reportData);
    return { url: reportData.url, reportId };
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    // For now, return a mock blob
    // In a real app, you'd download the actual report file
    return new Blob(['Mock report content'], { type: 'application/pdf' });
  },
};

// React Query hooks
export const useReports = (patientId: string) => {
  return useQuery({
    queryKey: ['reports', patientId],
    queryFn: () => reportsApi.getReports(patientId),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useReport = (reportId: string) => {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportsApi.getReport(reportId),
    enabled: !!reportId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsApi.generateReport,
    onSuccess: (_, patientId) => {
      // Invalidate reports list for the patient
      queryClient.invalidateQueries({ queryKey: ['reports', patientId] });
    },
    onError: (error) => {
      console.error('Report generation failed:', error);
    },
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: reportsApi.downloadReport,
    onError: (error) => {
      console.error('Report download failed:', error);
    },
  });
};
