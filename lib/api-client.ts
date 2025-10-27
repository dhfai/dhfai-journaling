import { ApiResponse } from '@/types/api';
import { CookieManager } from './cookie-manager';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    // Try cookies first (for SSR compatibility), then localStorage
    const cookieToken = CookieManager.get('access_token');
    if (cookieToken) return cookieToken;

    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private async refreshTokens(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const refreshToken = CookieManager.get('refresh_token') ||
                          (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);

      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.access_token) {
          // Update tokens
          CookieManager.set('access_token', data.data.access_token, {
            maxAge: 60 * 15,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', data.data.access_token);
          }

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private getHeaders(includeAuth: boolean = false): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (!response.ok) {
        // Don't treat auth failures as errors for refresh endpoint
        if (response.status === 401 && !window.location.pathname.includes('/auth/')) {
          // Token might be expired, but don't force logout here
          // Let the auth service handle this
        }

        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
      };
    }
  }

  async get<T>(endpoint: string, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, requireAuth);
  }

  async post<T>(endpoint: string, body?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, body, requireAuth);
  }

  async put<T>(endpoint: string, body?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, body, requireAuth);
  }

  async delete<T>(endpoint: string, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, requireAuth);
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any,
    requireAuth: boolean = false,
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: this.getHeaders(requireAuth),
        body: body ? JSON.stringify(body) : undefined,
      });

      // Handle 401 responses for authenticated requests
      if (response.status === 401 && requireAuth && !isRetry && !endpoint.includes('/auth/refresh')) {
        const refreshSuccess = await this.refreshTokens();
        if (refreshSuccess) {
          // Retry the request with new token
          return this.makeRequest<T>(method, endpoint, body, requireAuth, true);
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const apiClient = new ApiClient();
