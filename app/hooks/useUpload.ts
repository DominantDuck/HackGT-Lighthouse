import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSyncQueueStore } from '@/store/syncQueue';
import { apiClient } from '@/utils/api';
import { UploadProgress, UploadStatus } from '@/types/api';

interface UseUploadOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [error, setError] = useState<Error | null>(null);
  
  const { addItem } = useSyncQueueStore();

  const upload = useCallback(async (
    url: string,
    data: any,
    uploadOptions: {
      retryOnFailure?: boolean;
      queueOnOffline?: boolean;
    } = {}
  ) => {
    const { retryOnFailure = true, queueOnOffline = true } = uploadOptions;
    
    setStatus('uploading');
    setError(null);
    setProgress({ loaded: 0, total: 0, percentage: 0 });

    try {
      const result = await apiClient.upload(url, data, (progressData) => {
        setProgress(progressData);
        options.onProgress?.(progressData);
      });

      setStatus('completed');
      options.onSuccess?.(result);
      return result;
    } catch (error: any) {
      setError(error);
      setStatus('error');
      
      // If we should queue on offline or retry on failure
      if ((error.code === 'NETWORK_ERROR' && queueOnOffline) || (retryOnFailure && error.code !== 'NETWORK_ERROR')) {
        // Queue for retry
        addItem('upload', {
          url,
          data,
          timestamp: new Date().toISOString(),
        });
        
        Alert.alert(
          'Upload Queued',
          'Your upload will be retried when you\'re back online.',
          [{ text: 'OK' }]
        );
      }
      
      options.onError?.(error);
      throw error;
    }
  }, [addItem, options]);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError(null);
  }, []);

  return {
    upload,
    status,
    progress,
    error,
    reset,
    isUploading: status === 'uploading',
    isCompleted: status === 'completed',
    isError: status === 'error',
  };
}
