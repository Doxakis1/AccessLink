"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface UserProfileSummaryProps {
  className?: string
}

interface UserProfile {
  displayName: string
  avatar: string | null
  language: string
  location: string
  accessibilityNeeds: string
  bio: string
}

export function UserProfileSummary({ className = "" }: UserProfileSummaryProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile))
      } catch (e) {
        console.error("Failed to parse saved profile", e)
      }
    }
  }, [])

  if (!mounted) return null

  if (!profile) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Guest User</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Complete your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className="h-9 w-9">
        {profile.avatar ? (
          <AvatarImage src={profile.avatar || "/placeholder.svg"} alt="Profile picture" />
        ) : (
          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
            {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <p className="text-sm font-medium">{profile.displayName || "User"}</p>
        {profile.location && <p className="text-xs text-slate-500 dark:text-slate-400">{profile.location}</p>}
      </div>
    </div>
  )
}
