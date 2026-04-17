// Centralized API service with automatic auth handling
import { authHelper } from '../utils/authHelper';

const API_BASE_URL = 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private getHeaders(skipAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (!skipAuth) {
      const token = authHelper.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse(response: Response): Promise<any> {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error('401 Unauthorized - Clearing auth and redirecting to login');
      authHelper.clearAuth();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      throw new Error('Session expired. Please login again.');
    }

    // Handle other error status codes
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use default message
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    try {
      return await response.json();
    } catch (e) {
      // If response is not JSON, return empty object
      return {};
    }
  }

  async get(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(skipAuth),
        ...fetchOptions,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  async post(endpoint: string, data?: any, options: RequestOptions = {}): Promise<any> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(skipAuth),
        body: data ? JSON.stringify(data) : undefined,
        ...fetchOptions,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  async put(endpoint: string, data?: any, options: RequestOptions = {}): Promise<any> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(skipAuth),
        body: data ? JSON.stringify(data) : undefined,
        ...fetchOptions,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  async delete(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(skipAuth),
        ...fetchOptions,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Special method for file uploads
  async uploadFile(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<any> {
    const { skipAuth = false, ...fetchOptions } = options;
    
    try {
      const headers: HeadersInit = {};
      
      if (!skipAuth) {
        const token = authHelper.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      // Don't set Content-Type for FormData - browser will set it with boundary
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        ...fetchOptions,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Upload to ${endpoint} failed:`, error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance();
