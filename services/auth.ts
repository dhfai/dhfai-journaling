import { apiClient } from '@/lib/api-client';
import { CookieManager } from '@/lib/cookie-manager';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  OtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
} from '@/types/api';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    if (response.success && response.data) {
      this.setTokens(response.data.access_token, response.data.refresh_token);
    }

    return response;
  }

  static async register(userData: RegisterRequest): Promise<ApiResponse<void>> {
    return await apiClient.post('/auth/register', userData);
  }

  static async verifyOtp(otpData: OtpRequest): Promise<ApiResponse<void>> {
    return await apiClient.post('/auth/verify-otp', otpData);
  }

  static async requestOtp(email: string): Promise<ApiResponse<void>> {
    return await apiClient.post('/auth/request-otp', { email });
  }

  static async refreshToken(): Promise<ApiResponse<{ access_token: string; expires_in: number }>> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
      };
    }

    try {
      const response = await apiClient.post<{ access_token: string; expires_in: number }>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (response.success && response.data) {
        this.setAccessToken(response.data.access_token);
        return response;
      }

      // If refresh fails, clear tokens but don't force logout here
      if (response.status === 401) {
        this.clearTokens();
      }

      return {
        success: false,
        error: response.error || 'Token refresh failed',
      };
    } catch (error) {
      this.clearTokens();
      return {
        success: false,
        error: 'Token refresh failed',
      };
    }
  }

  static async logout(): Promise<ApiResponse<void>> {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    }

    this.clearTokens();

    return { success: true };
  }

  static async forgotPassword(email: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    return await apiClient.post('/auth/forgot-password', email);
  }

  static async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return await apiClient.post('/auth/reset-password', resetData);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';

    CookieManager.set('access_token', accessToken, {
      maxAge: 60 * 15, // 15 minutes
      secure: isProduction,
      sameSite: 'strict',
      httpOnly: false, // Allow JS access for client-side usage
    });

    CookieManager.set('refresh_token', refreshToken, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: isProduction,
      sameSite: 'strict',
      httpOnly: false,
    });

    // Keep localStorage as fallback for client-side usage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  static setAccessToken(accessToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';

    CookieManager.set('access_token', accessToken, {
      maxAge: 60 * 15, // 15 minutes
      secure: isProduction,
      sameSite: 'strict',
      httpOnly: false,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
    }
  }

  static getAccessToken(): string | null {
    // Try cookies first, then localStorage
    const cookieToken = CookieManager.get('access_token');
    if (cookieToken) return cookieToken;

    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  static getRefreshToken(): string | null {
    // Try cookies first, then localStorage
    const cookieToken = CookieManager.get('refresh_token');
    if (cookieToken) return cookieToken;

    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  static clearTokens(): void {
    CookieManager.remove('access_token');
    CookieManager.remove('refresh_token');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
