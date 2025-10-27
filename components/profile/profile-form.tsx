"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Profile, ProfileUpdateRequest } from "@/types/api"

interface ProfileFormProps {
  profile: Profile | null
  isEditing: boolean
  formData: ProfileUpdateRequest
  onFormChange: (data: ProfileUpdateRequest) => void
}

export function ProfileForm({ profile, isEditing, formData, onFormChange }: ProfileFormProps) {
  const handleChange = (field: keyof ProfileUpdateRequest, value: string) => {
    onFormChange({ ...formData, [field]: value })
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            {isEditing ? (
              <Input
                id="full_name"
                value={formData.full_name || ""}
                onChange={(e) => handleChange("full_name", e.target.value)}
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {profile?.full_name || "Not provided"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone_number"
                value={formData.phone_number || ""}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {profile?.phone_number || "Not provided"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            {isEditing ? (
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth || ""}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {profile?.date_of_birth
                  ? new Date(profile.date_of_birth).toLocaleDateString()
                  : "Not provided"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            {isEditing ? (
              <select
                id="gender"
                value={formData.gender || ""}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                {profile?.gender || "Not provided"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            {isEditing ? (
              <Input
                id="country"
                value={formData.country || ""}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="Enter your country"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {profile?.country || "Not provided"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            {isEditing ? (
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Enter your city"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {profile?.city || "Not provided"}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          {isEditing ? (
            <textarea
              id="bio"
              value={formData.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          ) : (
            <p className="text-sm text-muted-foreground min-h-[100px]">
              {profile?.bio || "No bio provided"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
