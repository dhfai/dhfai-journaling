import { ApiResponse } from '@/types/api';
import { CookieManager } from './cookie-manager';
import AuthInterceptor from './auth-interceptor';

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
        // Handle 401 Unauthorized - Token expired
        if (response.status === 401) {
          // Show toast notification
          AuthInterceptor.handleTokenExpired();

          // Clear all auth data
          this.clearAuthData();

          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/get-started')) {
            setTimeout(() => {
              window.location.href = '/get-started';
            }, 500); // Small delay to show toast
          }
        }

        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      if (data && typeof data === 'object' && 'success' in data) {
        return data;
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
      };
    }
  }

  private clearAuthData(): void {
    // Clear cookies
    CookieManager.remove('access_token');
    CookieManager.remove('refresh_token');

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
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

  async patch<T>(endpoint: string, body?: any, requireAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, body, requireAuth);
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
        } else {
          // Refresh failed, show notification, clear auth and redirect
          AuthInterceptor.handleTokenExpired();
          this.clearAuthData();

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/get-started')) {
            setTimeout(() => {
              window.location.href = '/get-started';
            }, 500);
          }
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
