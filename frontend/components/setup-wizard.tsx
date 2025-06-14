"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  Hand,
  Volume2,
  Bell,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Palette,
  Phone,
  User,
  MapPin,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAccessibility } from "@/contexts/accessibility-context"
import { StatusAnnouncer } from "@/components/status-announcer"
import { SkipLink } from "@/components/skip-link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Define the user profile interface
interface UserProfile {
  displayName: string
  avatar: string | null
  language: string
  location: string
  accessibilityNeeds: string
  bio: string
}

// Define the default avatar options
const avatarOptions = [
  { id: "avatar1", url: "/placeholder.svg?height=100&width=100" },
  { id: "avatar2", url: "/placeholder.svg?height=100&width=100" },
  { id: "avatar3", url: "/placeholder.svg?height=100&width=100" },
  { id: "avatar4", url: "/placeholder.svg?height=100&width=100" },
  { id: "avatar5", url: "/placeholder.svg?height=100&width=100" },
  { id: "avatar6", url: "/placeholder.svg?height=100&width=100" },
]

// Language options
const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
]

export default function SetupWizard() {
  const router = useRouter()
  const { settings, updateSetting, saveSettings } = useAccessibility()
  const [currentStep, setCurrentStep] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [emergencyContact, setEmergencyContact] = useState({ name: "", phone: "", relationship: "" })
  const [mounted, setMounted] = useState(false)

  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    avatar: null,
    language: "en",
    location: "",
    accessibilityNeeds: "",
    bio: "",
  })

  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Try to load existing profile data
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile((prevProfile) => ({
          ...prevProfile,
          ...parsedProfile,
        }))
      } catch (e) {
        console.error("Failed to parse saved profile", e)
      }
    }

    // Try to load user name from users in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    if (users.length > 0) {
      const lastUser = users[users.length - 1]
      if (lastUser && lastUser.name && !profile.displayName) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          displayName: lastUser.name,
        }))
      }
    }
  }, [])

  // Define the steps of the wizard
  const steps = [
    { id: "welcome", title: "Welcome", icon: <Monitor className="h-6 w-6" /> },
    { id: "profile", title: "Profile", icon: <User className="h-6 w-6" /> },
    { id: "visual", title: "Visual", icon: <Eye className="h-6 w-6" /> },
    { id: "interaction", title: "Interaction", icon: <Hand className="h-6 w-6" /> },
    { id: "audio", title: "Audio", icon: <Volume2 className="h-6 w-6" /> },
    { id: "emergency", title: "Emergency", icon: <Phone className="h-6 w-6" /> },
    { id: "notifications", title: "Notifications", icon: <Bell className="h-6 w-6" /> },
    { id: "privacy", title: "Privacy", icon: <Shield className="h-6 w-6" /> },
    { id: "complete", title: "Complete", icon: <Check className="h-6 w-6" /> },
  ]

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setStatusMessage(`Step ${currentStep + 2} of ${steps.length}: ${steps[currentStep + 1].title}`)
      window.scrollTo(0, 0)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setStatusMessage(`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1].title}`)
      window.scrollTo(0, 0)
    }
  }

  // Handle skip to home
  const handleSkip = () => {
    saveSettings()
    saveProfile()
    router.push("/home")
  }

  // Handle completion
  const handleComplete = () => {
    saveSettings()
    saveProfile()

    // Save emergency contact to local storage
    if (emergencyContact.name && emergencyContact.phone) {
      const contacts = JSON.parse(localStorage.getItem("emergencyContacts") || "[]")
      contacts.push({
        ...emergencyContact,
        id: Date.now().toString(),
        isPrimary: contacts.length === 0,
      })
      localStorage.setItem("emergencyContacts", JSON.stringify(contacts))
    }

    setStatusMessage("Setup complete! Redirecting to home screen.")
    setTimeout(() => {
      router.push("/home")
    }, 1500)
  }

  // Save profile to localStorage
  const saveProfile = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile))
  }

  // Handle avatar selection
  const handleAvatarSelect = (url: string) => {
    setProfile({
      ...profile,
      avatar: url,
    })
    setStatusMessage("Avatar selected")
  }

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // For demo purposes, we'll just use a URL.createObjectURL
      // In a real app, you would upload this to a server
      const url = URL.createObjectURL(file)
      setProfile({
        ...profile,
        avatar: url,
      })
      setStatusMessage("Avatar uploaded")
    }
  }

  // Handle profile field changes
  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile({
      ...profile,
      [field]: value,
    })
  }

  // Clear avatar
  const clearAvatar = () => {
    setProfile({
      ...profile,
      avatar: null,
    })
    setStatusMessage("Avatar removed")
  }

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  if (!mounted) return null

  return (
    <>
      <SkipLink />
      <StatusAnnouncer message={statusMessage} />

      <main id="main-content" className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4" tabIndex={-1}>
        <div className="container max-w-3xl mx-auto py-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Step {currentStep + 1} of {steps.length}
              </h2>
              {currentStep < steps.length - 1 && (
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-sm">
                  Skip setup
                </Button>
              )}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                role="progressbar"
                aria-valuenow={((currentStep + 1) / steps.length) * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"
                  }`}
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      index <= currentStep ? "bg-blue-100 dark:bg-blue-900" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <Card className="border-2">
            {/* Welcome Step */}
            {currentStep === 0 && (
              <>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl md:text-3xl">Welcome to AccessLink</CardTitle>
                  <CardDescription className="text-lg">Let's set up your accessibility preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Smartphone className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p>This wizard will help you customize the app to meet your specific needs.</p>
                    <p>We'll guide you through setting up your profile and accessibility preferences.</p>
                    <p className="font-medium">You can change these settings at any time from the Settings menu.</p>
                  </div>
                </CardContent>
              </>
            )}

            {/* Profile Step */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Complete Your Profile
                  </CardTitle>
                  <CardDescription>Personalize your experience with AccessLink</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Profile Picture</Label>

                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-2 border-blue-200 dark:border-blue-800">
                          {profile.avatar ? (
                            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt="Profile picture" />
                          ) : (
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-2xl">
                              {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {profile.avatar && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 rounded-full w-6 h-6"
                            onClick={clearAvatar}
                            aria-label="Remove avatar"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Choose an avatar:</Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          {avatarOptions.map((avatar) => (
                            <button
                              key={avatar.id}
                              type="button"
                              onClick={() => handleAvatarSelect(avatar.url)}
                              className={`p-1 rounded-md ${
                                profile.avatar === avatar.url
                                  ? "ring-2 ring-blue-500 dark:ring-blue-400"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                              aria-label={`Select avatar ${avatar.id}`}
                              aria-pressed={profile.avatar === avatar.url}
                            >
                              <Avatar className="w-12 h-12">
                                <AvatarImage
                                  src={avatar.url || "/placeholder.svg"}
                                  alt={`Avatar option ${avatar.id}`}
                                />
                              </Avatar>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <Label htmlFor="avatar-upload" className="text-sm font-medium mb-2 block">
                          Or upload your own:
                        </Label>
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Upload Image</span>
                          </Button>
                          <input
                            ref={fileInputRef}
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="sr-only"
                            aria-label="Upload profile picture"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-lg font-medium">
                      Display Name
                    </Label>
                    <Input
                      id="display-name"
                      placeholder="How you want to be called"
                      value={profile.displayName}
                      onChange={(e) => handleProfileChange("displayName", e.target.value)}
                      aria-label="Display name"
                    />
                  </div>

                  {/* Language Preference */}
                  <div className="space-y-2">
                    <Label htmlFor="language-select" className="text-lg font-medium">
                      Preferred Language
                    </Label>
                    <Select value={profile.language} onValueChange={(value) => handleProfileChange("language", value)}>
                      <SelectTrigger id="language-select" className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-slate-500">
                      This helps us provide content in your preferred language when available
                    </p>
                  </div>

                  {/* Location (Optional) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="location" className="text-lg font-medium">
                        Location (Optional)
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-slate-400 mr-2" aria-hidden="true" />
                      <Input
                        id="location"
                        placeholder="City, Country"
                        value={profile.location}
                        onChange={(e) => handleProfileChange("location", e.target.value)}
                        aria-label="Location"
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      Helps us provide location-specific accessibility information
                    </p>
                  </div>

                  {/* Accessibility Needs */}
                  <div className="space-y-2">
                    <Label htmlFor="accessibility-needs" className="text-lg font-medium">
                      Accessibility Needs (Optional)
                    </Label>
                    <Textarea
                      id="accessibility-needs"
                      placeholder="Briefly describe any specific accessibility needs you have"
                      value={profile.accessibilityNeeds}
                      onChange={(e) => handleProfileChange("accessibilityNeeds", e.target.value)}
                      className="min-h-[80px]"
                      aria-label="Accessibility needs"
                    />
                    <p className="text-sm text-slate-500">
                      This helps us better understand your needs and improve our services
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-lg font-medium">
                      About Me (Optional)
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself"
                      value={profile.bio}
                      onChange={(e) => handleProfileChange("bio", e.target.value)}
                      className="min-h-[100px]"
                      aria-label="About me"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Your profile information helps us personalize your experience. You can update this information
                      anytime from your profile settings.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            {/* Visual Settings Step */}
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Visual Settings
                  </CardTitle>
                  <CardDescription>Customize how content appears on your screen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="theme-select" className="text-lg font-medium">
                      Theme
                    </Label>
                    <RadioGroup
                      value={settings.theme}
                      onValueChange={(value) => updateSetting("theme", value as any)}
                      className="grid grid-cols-4 gap-4"
                    >
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                        <Label htmlFor="theme-system" className="cursor-pointer flex flex-col items-center">
                          <Monitor className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>System</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                        <Label htmlFor="theme-light" className="cursor-pointer flex flex-col items-center">
                          <Sun className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Light</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                        <Label htmlFor="theme-dark" className="cursor-pointer flex flex-col items-center">
                          <Moon className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Dark</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="high-contrast" id="theme-high-contrast" className="sr-only" />
                        <Label htmlFor="theme-high-contrast" className="cursor-pointer flex flex-col items-center">
                          <Palette className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>High Contrast</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="font-size-slider" className="text-lg font-medium">
                        Text Size
                      </Label>
                      <span className="text-sm font-medium" aria-hidden="true">
                        {settings.fontSize}%
                      </span>
                    </div>
                    <Slider
                      id="font-size-slider"
                      min={75}
                      max={200}
                      step={5}
                      value={[settings.fontSize]}
                      onValueChange={(value) => updateSetting("fontSize", value[0])}
                      aria-label={`Text size: ${settings.fontSize}%`}
                      aria-valuemin={75}
                      aria-valuemax={200}
                      aria-valuenow={settings.fontSize}
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>A</span>
                      <span>A</span>
                      <span className="text-base">A</span>
                      <span className="text-lg">A</span>
                      <span className="text-xl">A</span>
                    </div>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast-toggle" className="text-lg font-medium">
                        High Contrast Mode
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Enhance visual distinction between elements
                      </p>
                    </div>
                    <Switch
                      id="high-contrast-toggle"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                      aria-label="Toggle high contrast mode"
                    />
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduced-motion-toggle" className="text-lg font-medium">
                        Reduced Motion
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Minimize animations and transitions</p>
                    </div>
                    <Switch
                      id="reduced-motion-toggle"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                      aria-label="Toggle reduced motion"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Interaction Settings Step */}
            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hand className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Interaction Settings
                  </CardTitle>
                  <CardDescription>Customize how you interact with the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Touch Target Size */}
                  <div className="space-y-3">
                    <Label className="text-lg font-medium">Touch Target Size</Label>
                    <RadioGroup
                      value={settings.touchTargetSize}
                      onValueChange={(value) => updateSetting("touchTargetSize", value as any)}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="default" id="target-default" className="sr-only" />
                        <Label htmlFor="target-default" className="cursor-pointer flex flex-col items-center">
                          <div className="w-8 h-8 border-2 border-dashed rounded-md mb-2"></div>
                          <span>Default</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="large" id="target-large" className="sr-only" />
                        <Label htmlFor="target-large" className="cursor-pointer flex flex-col items-center">
                          <div className="w-10 h-10 border-2 border-dashed rounded-md mb-2"></div>
                          <span>Large</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="extra-large" id="target-extra-large" className="sr-only" />
                        <Label htmlFor="target-extra-large" className="cursor-pointer flex flex-col items-center">
                          <div className="w-12 h-12 border-2 border-dashed rounded-md mb-2"></div>
                          <span>Extra Large</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="keyboard-shortcuts-toggle" className="text-lg font-medium">
                        Keyboard Shortcuts
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Enable keyboard shortcuts for quick navigation
                      </p>
                    </div>
                    <Switch
                      id="keyboard-shortcuts-toggle"
                      checked={settings.keyboardShortcuts}
                      onCheckedChange={(checked) => updateSetting("keyboardShortcuts", checked)}
                      aria-label="Toggle keyboard shortcuts"
                    />
                  </div>

                  {/* Haptic Feedback */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="haptic-feedback-toggle" className="text-lg font-medium">
                        Haptic Feedback
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Enable vibration feedback on interactions
                      </p>
                    </div>
                    <Switch
                      id="haptic-feedback-toggle"
                      checked={settings.hapticFeedback}
                      onCheckedChange={(checked) => updateSetting("hapticFeedback", checked)}
                      aria-label="Toggle haptic feedback"
                    />
                  </div>

                  {/* Haptic Intensity */}
                  {settings.hapticFeedback && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="haptic-intensity-slider" className="text-lg font-medium">
                          Haptic Intensity
                        </Label>
                        <span className="text-sm font-medium" aria-hidden="true">
                          {settings.hapticIntensity}%
                        </span>
                      </div>
                      <Slider
                        id="haptic-intensity-slider"
                        min={0}
                        max={100}
                        step={10}
                        value={[settings.hapticIntensity]}
                        onValueChange={(value) => updateSetting("hapticIntensity", value[0])}
                        aria-label={`Haptic intensity: ${settings.hapticIntensity}%`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={settings.hapticIntensity}
                        disabled={!settings.hapticFeedback}
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Gentle</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* Audio Settings Step */}
            {currentStep === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Audio & Speech Settings
                  </CardTitle>
                  <CardDescription>Customize audio feedback and speech options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Screen Reader */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="screen-reader-toggle" className="text-lg font-medium">
                        Screen Reader Support
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Optimize for screen readers</p>
                    </div>
                    <Switch
                      id="screen-reader-toggle"
                      checked={settings.screenReader}
                      onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                      aria-label="Toggle screen reader support"
                    />
                  </div>

                  {/* Voice Control */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="voice-control-toggle" className="text-lg font-medium">
                        Voice Control
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Control the app using voice commands</p>
                    </div>
                    <Switch
                      id="voice-control-toggle"
                      checked={settings.voiceControl}
                      onCheckedChange={(checked) => updateSetting("voiceControl", checked)}
                      aria-label="Toggle voice control"
                    />
                  </div>

                  {/* Audio Feedback */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="audio-feedback-toggle" className="text-lg font-medium">
                        Audio Feedback
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Play sounds on actions and events</p>
                    </div>
                    <Switch
                      id="audio-feedback-toggle"
                      checked={settings.audioFeedback}
                      onCheckedChange={(checked) => updateSetting("audioFeedback", checked)}
                      aria-label="Toggle audio feedback"
                    />
                  </div>

                  {/* Audio Volume */}
                  {settings.audioFeedback && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="audio-volume-slider" className="text-lg font-medium">
                          Audio Volume
                        </Label>
                        <span className="text-sm font-medium" aria-hidden="true">
                          {settings.audioVolume}%
                        </span>
                      </div>
                      <Slider
                        id="audio-volume-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[settings.audioVolume]}
                        onValueChange={(value) => updateSetting("audioVolume", value[0])}
                        aria-label={`Audio volume: ${settings.audioVolume}%`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={settings.audioVolume}
                        disabled={!settings.audioFeedback}
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Quiet</span>
                        <span>Loud</span>
                      </div>
                    </div>
                  )}

                  {/* Speech Rate */}
                  {(settings.screenReader || settings.voiceControl) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="speech-rate-slider" className="text-lg font-medium">
                          Speech Rate
                        </Label>
                        <span className="text-sm font-medium" aria-hidden="true">
                          {settings.speechRate}%
                        </span>
                      </div>
                      <Slider
                        id="speech-rate-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[settings.speechRate]}
                        onValueChange={(value) => updateSetting("speechRate", value[0])}
                        aria-label={`Speech rate: ${settings.speechRate}%`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={settings.speechRate}
                        disabled={!settings.screenReader && !settings.voiceControl}
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* Emergency Contact Step */}
            {currentStep === 5 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Emergency Contact
                  </CardTitle>
                  <CardDescription>Add an emergency contact for quick access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-lg font-medium">
                        Contact Name
                      </Label>
                      <Input
                        id="contact-name"
                        placeholder="Enter name"
                        value={emergencyContact.name}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-phone" className="text-lg font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="contact-phone"
                        placeholder="Enter phone number"
                        value={emergencyContact.phone}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-relationship" className="text-lg font-medium">
                        Relationship
                      </Label>
                      <Select
                        value={emergencyContact.relationship}
                        onValueChange={(value) => setEmergencyContact({ ...emergencyContact, relationship: value })}
                      >
                        <SelectTrigger id="contact-relationship">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="caregiver">Caregiver</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      This contact will be available for quick access during emergencies. You can add more contacts
                      later in the settings.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            {/* Notification Settings Step */}
            {currentStep === 6 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Customize how you receive alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Alert Style */}
                  <div className="space-y-3">
                    <Label className="text-lg font-medium">Alert Style</Label>
                    <RadioGroup
                      value={settings.alertStyle}
                      onValueChange={(value) => updateSetting("alertStyle", value as any)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="visual" id="alert-visual" className="sr-only" />
                        <Label htmlFor="alert-visual" className="cursor-pointer flex flex-col items-center">
                          <Monitor className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Visual Only</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="audio" id="alert-audio" className="sr-only" />
                        <Label htmlFor="alert-audio" className="cursor-pointer flex flex-col items-center">
                          <Volume2 className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Audio Only</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="haptic" id="alert-haptic" className="sr-only" />
                        <Label htmlFor="alert-haptic" className="cursor-pointer flex flex-col items-center">
                          <Hand className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Haptic Only</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="all" id="alert-all" className="sr-only" />
                        <Label htmlFor="alert-all" className="cursor-pointer flex flex-col items-center">
                          <Bell className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>All Methods</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Alert Duration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alert-duration-slider" className="text-lg font-medium">
                        Alert Duration
                      </Label>
                      <span className="text-sm font-medium" aria-hidden="true">
                        {settings.alertDuration} seconds
                      </span>
                    </div>
                    <Slider
                      id="alert-duration-slider"
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.alertDuration]}
                      onValueChange={(value) => updateSetting("alertDuration", value[0])}
                      aria-label={`Alert duration: ${settings.alertDuration} seconds`}
                      aria-valuemin={1}
                      aria-valuemax={10}
                      aria-valuenow={settings.alertDuration}
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Brief</span>
                      <span>Extended</span>
                    </div>
                  </div>

                  {/* Alert Intensity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alert-intensity-slider" className="text-lg font-medium">
                        Alert Intensity
                      </Label>
                      <span className="text-sm font-medium" aria-hidden="true">
                        {settings.alertIntensity}%
                      </span>
                    </div>
                    <Slider
                      id="alert-intensity-slider"
                      min={10}
                      max={100}
                      step={10}
                      value={[settings.alertIntensity]}
                      onValueChange={(value) => updateSetting("alertIntensity", value[0])}
                      aria-label={`Alert intensity: ${settings.alertIntensity}%`}
                      aria-valuemin={10}
                      aria-valuemax={100}
                      aria-valuenow={settings.alertIntensity}
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtle</span>
                      <span>Prominent</span>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Privacy Settings Step */}
            {currentStep === 7 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>Control your data and privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Data Retention */}
                  <div className="space-y-3">
                    <Label htmlFor="data-retention" className="text-lg font-medium">
                      Data Retention Period
                    </Label>
                    <Select
                      value={settings.dataRetention.toString()}
                      onValueChange={(value) => updateSetting("dataRetention", Number.parseInt(value))}
                    >
                      <SelectTrigger id="data-retention">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">6 months</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-slate-500">How long we keep your activity data</p>
                  </div>

                  {/* Usage Analytics */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="usage-analytics-toggle" className="text-lg font-medium">
                        Usage Analytics
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Share anonymous usage data to help improve our services
                      </p>
                    </div>
                    <Switch
                      id="usage-analytics-toggle"
                      checked={settings.usageAnalytics}
                      onCheckedChange={(checked) => updateSetting("usageAnalytics", checked)}
                      aria-label="Toggle usage analytics"
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Your privacy is important to us. We never share your personal information with third parties
                      without your explicit consent.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            {/* Completion Step */}
            {currentStep === 8 && (
              <>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl md:text-3xl">Setup Complete!</CardTitle>
                  <CardDescription className="text-lg">Your profile and preferences have been saved</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p>You've successfully set up your profile and accessibility preferences.</p>
                    <p>You can change these settings at any time from the Settings menu.</p>
                    <p className="font-medium">Click "Finish" to start using the app.</p>
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Previous</span>
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <span>Finish</span>
                  <Check className="w-4 h-4" aria-hidden="true" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  )
}
