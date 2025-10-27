"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Profile } from "@/types/api"
import { IconUser, IconMail, IconCalendar, IconShield } from "@tabler/icons-react"

interface ProfileInfoCardProps {
  user: User
  profile: Profile | null
}

export function ProfileInfoCard({ user, profile }: ProfileInfoCardProps) {
  const userInitials = user.username
    ? user.username.substring(0, 2).toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "U"

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile?.avatar} alt={user.username} />
            <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {profile?.full_name || user.username}
        </CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <IconUser className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{user.username}</span>
        </div>
        <div className="flex items-center gap-2">
          <IconMail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{user.email}</span>
        </div>
        {user.created_at && (
          <div className="flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <IconShield className="w-4 h-4 text-muted-foreground" />
          <Badge variant={user.is_verified ? "default" : "secondary"}>
            {user.is_verified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
