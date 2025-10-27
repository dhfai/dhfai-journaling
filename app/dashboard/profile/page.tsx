"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { ProfileInfoCard } from "@/components/profile/profile-info-card"
import { ProfileForm } from "@/components/profile/profile-form"
import { Skeleton } from "@/components/ui/skeleton"
import { IconEdit, IconDeviceFloppy, IconX } from "@tabler/icons-react"
import { ProfileUpdateRequest } from "@/types/api"

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, isLoading, isUpdating, updateProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileUpdateRequest>({})

  // Initialize form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone_number: profile.phone_number || "",
        country: profile.country || "",
        city: profile.city || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    const success = await updateProfile(formData)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone_number: profile.phone_number || "",
        country: profile.country || "",
        city: profile.city || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96 md:col-span-1" />
          <Skeleton className="h-96 md:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <IconEdit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isUpdating}>
              <IconDeviceFloppy className="w-4 h-4 mr-2" />
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={isUpdating}>
              <IconX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ProfileInfoCard user={user} profile={profile} />
        <ProfileForm
          profile={profile}
          isEditing={isEditing}
          formData={formData}
          onFormChange={setFormData}
        />
      </div>
    </div>
  )
}
