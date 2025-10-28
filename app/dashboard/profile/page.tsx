"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Cake,
  Shield,
  Clock,
  Globe,
  Palette,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  Languages,
  Save,
  X
} from "lucide-react"
import { PageTransition } from "@/components/utils/page-transition"
import { format } from "date-fns"
import { ProfileService } from "@/services/profile"
import { toast } from "sonner"
import { ThemeSwitch } from "@/components/utils/theme-switch"

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, isLoading, updateProfile, isUpdating } = useProfile()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    avatar: "",
    full_name: "",
    bio: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    country: "",
    city: "",
    timezone: "",
    language: ""
  })

  // Open dialog and populate form with current profile data
  const handleEditClick = () => {
    if (profile) {
      setFormData({
        avatar: profile.avatar || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        phone_number: profile.phone_number || "",
        date_of_birth: profile.date_of_birth ? format(new Date(profile.date_of_birth), "yyyy-MM-dd") : "",
        gender: profile.gender || "",
        country: profile.country || "",
        city: profile.city || "",
        timezone: profile.timezone || "",
        language: profile.language || ""
      })
    }
    setIsEditDialogOpen(true)
  }

  // Handle form submission
  const handleSaveProfile = async () => {
    try {
      const success = await updateProfile(formData)
      if (success) {
        toast.success("Profile updated successfully!")
        setIsEditDialogOpen(false)
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred while updating profile")
    }
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
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96 mb-2" />
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Skeleton className="h-[450px]" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </div>
    )
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'U'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided"
    try {
      return format(new Date(dateString), "PPP")
    } catch {
      return "Invalid date"
    }
  }

  const getGenderLabel = (gender: string | null) => {
    if (!gender) return "Not specified"
    return gender === "L" ? "Male" : gender === "P" ? "Female" : "Other"
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
            <Button className="gap-2" onClick={handleEditClick}>
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-4">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.avatar || undefined} alt={profile?.full_name || user?.username} />
                    <AvatarFallback className="text-2xl font-semibold bg-[#4E5173] text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 w-full">
                    <h2 className="text-2xl font-bold">
                      {profile?.full_name || user?.username || "User"}
                    </h2>
                    <p className="text-sm text-muted-foreground">@{user?.username}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>

                  {profile?.bio && (
                    <>
                      <Separator />
                      <p className="text-sm text-muted-foreground text-left w-full">
                        {profile.bio}
                      </p>
                    </>
                  )}

                  <Separator />

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 justify-center w-full">
                    <Badge variant={user?.is_verified ? "default" : "secondary"} className="gap-1">
                      {user?.is_verified ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {user?.is_verified ? "Verified" : "Not Verified"}
                    </Badge>
                    <Badge variant={user?.is_active ? "default" : "destructive"} className="gap-1">
                      {user?.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {user?.role || "User"}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Account Info */}
                  <div className="w-full space-y-2 text-left text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(user?.created_at || null)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Last updated {formatDate(profile?.updated_at || null)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Settings Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label="Full Name"
                    value={profile?.full_name || "Not provided"}
                  />
                  <InfoItem
                    icon={<Mail className="h-4 w-4" />}
                    label="Email Address"
                    value={user?.email || "Not provided"}
                  />
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone Number"
                    value={profile?.phone_number || "Not provided"}
                  />
                  <InfoItem
                    icon={<Cake className="h-4 w-4" />}
                    label="Date of Birth"
                    value={formatDate(profile?.date_of_birth || null)}
                  />
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label="Gender"
                    value={getGenderLabel(profile?.gender || null)}
                  />
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location"
                    value={profile?.city && profile?.country ? `${profile.city}, ${profile.country}` : "Not provided"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Timezone */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Location & Regional Settings
                </CardTitle>
                <CardDescription>
                  Your timezone and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="Country"
                    value={profile?.country || "Not provided"}
                  />
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="City"
                    value={profile?.city || "Not provided"}
                  />
                  <InfoItem
                    icon={<Clock className="h-4 w-4" />}
                    label="Timezone"
                    value={profile?.timezone || "Not provided"}
                  />
                  <InfoItem
                    icon={<Languages className="h-4 w-4" />}
                    label="Language"
                    value={profile?.language?.toUpperCase() || "Not provided"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  App Preferences
                </CardTitle>
                <CardDescription>
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Switch */}
                <ThemeSwitch />

                <Separator />

                {/* Language Preference */}
                <InfoItem
                  icon={<Languages className="h-4 w-4" />}
                  label="Language Preference"
                  value={
                    <Badge variant="outline" className="uppercase">
                      {profile?.language || "EN"}
                    </Badge>
                  }
                />
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Details
                </CardTitle>
                <CardDescription>
                  Your account status and security information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label="Username"
                    value={user?.username || "Not provided"}
                  />
                  <InfoItem
                    icon={<Shield className="h-4 w-4" />}
                    label="User ID"
                    value={
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {user?.id?.slice(0, 8)}...
                      </code>
                    }
                  />
                  <InfoItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Account Created"
                    value={formatDate(user?.created_at || null)}
                  />
                  <InfoItem
                    icon={<Clock className="h-4 w-4" />}
                    label="Last Updated"
                    value={formatDate(user?.updated_at || null)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information. Changes will be saved to your account.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Avatar Preview & URL Input */}
            <div className="space-y-4">
              <Label htmlFor="avatar">Avatar URL</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage src={formData.avatar || profile?.avatar || undefined} alt="Avatar preview" />
                  <AvatarFallback className="bg-[#4E5173] text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    id="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a valid image URL for your profile picture
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location: Country and City */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g., United States"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., New York"
                />
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Indonesian</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isUpdating}
              className="bg-[#4E5173] hover:bg-[#3d3f5c]"
            >
              {isUpdating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

// Info Item Component
interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium pl-6">
        {typeof value === 'string' ? value : value}
      </div>
    </div>
  )
}
