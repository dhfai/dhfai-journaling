"use client"

import { useState, useEffect, useCallback } from "react"
import { ProfileService } from "@/services/profile"
import { Profile, ProfileUpdateRequest } from "@/types/api"
import { toast } from "sonner"
import { CookieManager } from "@/lib/cookie-manager"

interface UseProfileReturn {
  profile: Profile | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null
  updateProfile: (data: ProfileUpdateRequest) => Promise<boolean>
  refreshProfile: () => Promise<void>
  updateAvatar: (avatarUrl: string) => Promise<boolean>
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    // Check if user is authenticated before fetching profile
    const accessToken = CookieManager.get('access_token')
    const refreshToken = CookieManager.get('refresh_token')

    if (!accessToken && !refreshToken) {
      // User not authenticated, skip fetch
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await ProfileService.getProfile()

      if (response.success && response.data) {
        setProfile(response.data.profile)
      } else {
        setError(response.error || "Failed to fetch profile")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      // Don't log error to console if it's just "Missing authorization header"
      if (!errorMessage.includes("Missing authorization header")) {
        console.error("Failed to fetch profile:", err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: ProfileUpdateRequest): Promise<boolean> => {
    try {
      setIsUpdating(true)
      setError(null)

      const response = await ProfileService.updateProfile(data)

      if (response.success && response.data) {
        setProfile(response.data.profile)
        toast.success("Profile updated successfully")
        return true
      } else {
        const errorMessage = response.error || "Failed to update profile"
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Failed to update profile:", err)
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const updateAvatar = useCallback(async (avatarUrl: string): Promise<boolean> => {
    try {
      setIsUpdating(true)
      setError(null)

      const response = await ProfileService.updateAvatar(avatarUrl)

      if (response.success) {
        // Refresh profile to get updated avatar
        await fetchProfile()
        toast.success("Avatar updated successfully")
        return true
      } else {
        const errorMessage = response.error || "Failed to update avatar"
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Failed to update avatar:", err)
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [fetchProfile])

  const refreshProfile = useCallback(async () => {
    await fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    refreshProfile,
    updateAvatar,
  }
}
