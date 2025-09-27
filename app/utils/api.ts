import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useSessionStore } from '@/store/session';
import { ApiResponse, ApiError } from '@/types/api';

// Use Firebase as primary data source instead of mock API
const API_BASE_URL = 'firebase'; // This will trigger Firebase usage

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useSessionStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 - Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await useSessionStore.getState().clear();
          // Redirect to login will be handled by the auth provider
          return Promise.reject(error);
        }

        // Handle 429 - Rate limiting with exponential backoff
        if (error.response?.status === 429 && !originalRequest._retry) {
          originalRequest._retry = true;
          const retryAfter = error.response.headers['retry-after'] || 1;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.client(originalRequest);
        }

        // Handle network errors
        if (!error.response) {
          const networkError: ApiError = {
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
          };
          return Promise.reject(networkError);
        }

        // Handle API errors
        const apiError: ApiError = {
          message: error.response.data?.message || 'An error occurred',
          code: error.response.data?.code || 'UNKNOWN_ERROR',
          details: error.response.data?.details,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload with progress tracking
  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  ): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const { get, post, put, delete: del, upload, healthCheck } = apiClient;
