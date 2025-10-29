import { apiClient } from '@/lib/api-client';
import {
  ProfileResponse,
  ProfileUpdateRequest,
  ChangePasswordRequest,
  ApiResponse,
} from '@/types/api';

export class ProfileService {
  /**
   * Fetch the current user's profile
   * @returns Promise with profile data including user and profile information
   */
  static async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    try {
      const response = await apiClient.get<ProfileResponse>('/profile', true);

      // Don't log error if user is simply not authenticated
      if (!response.success && response.error && !response.error.includes("Missing authorization header")) {
        console.error('Failed to get profile:', response.error);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile'
      // Don't log error if user is simply not authenticated
      if (!errorMessage.includes("Missing authorization header")) {
        console.error('Error getting profile:', error);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Create a new profile for the current user
   * @param profileData - Profile information to create
   * @returns Promise with created profile data
   */
  static async createProfile(profileData: ProfileUpdateRequest): Promise<ApiResponse<ProfileResponse>> {
    try {
      const response = await apiClient.post<ProfileResponse>('/profile', profileData, true);

      if (!response.success) {
        console.error('Failed to create profile:', response.error);
      }

      return response;
    } catch (error) {
      console.error('Error creating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create profile',
      };
    }
  }

  /**
   * Update the current user's profile
   * @param profileData - Profile fields to update (partial update supported)
   * @returns Promise with updated profile data
   */
  static async updateProfile(profileData: ProfileUpdateRequest): Promise<ApiResponse<ProfileResponse>> {
    try {
      // Filter out empty strings and undefined values
      const cleanedData = Object.entries(profileData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key as keyof ProfileUpdateRequest] = value;
        }
        return acc;
      }, {} as ProfileUpdateRequest);

      const response = await apiClient.put<ProfileResponse>('/profile', cleanedData, true);

      if (!response.success) {
        console.error('Failed to update profile:', response.error);
      }

      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  /**
   * Update user's avatar
   * @param avatarUrl - URL of the new avatar image
   * @returns Promise indicating success or failure
   */
  static async updateAvatar(avatarUrl: string): Promise<ApiResponse<void>> {
    try {
      if (!avatarUrl || !avatarUrl.trim()) {
        return {
          success: false,
          error: 'Avatar URL is required',
        };
      }

      const response = await apiClient.put<void>('/profile/avatar', { avatar_url: avatarUrl }, true);

      if (!response.success) {
        console.error('Failed to update avatar:', response.error);
      }

      return response;
    } catch (error) {
      console.error('Error updating avatar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update avatar',
      };
    }
  }

  /**
   * Change user's password
   * @param passwordData - Old and new password
   * @returns Promise indicating success or failure
   */
  static async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      if (!passwordData.old_password || !passwordData.new_password) {
        return {
          success: false,
          error: 'Both old and new passwords are required',
        };
      }

      if (passwordData.old_password === passwordData.new_password) {
        return {
          success: false,
          error: 'New password must be different from old password',
        };
      }

      const response = await apiClient.put<void>('/profile/change-password', passwordData, true);

      if (!response.success) {
        console.error('Failed to change password:', response.error);
      }

      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      };
    }
  }
}
