"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define types for our settings
export interface AccessibilitySettings {
  // Visual
  theme: "system" | "light" | "dark" | "high-contrast"
  fontSize: number
  fontFamily: string
  reducedMotion: boolean
  highContrast: boolean

  // Interaction
  touchTargetSize: "default" | "large" | "extra-large"
  keyboardShortcuts: boolean
  hapticFeedback: boolean
  hapticIntensity: number

  // Audio & Speech
  screenReader: boolean
  voiceControl: boolean
  audioFeedback: boolean
  audioVolume: number
  speechRate: number

  // Language & Communication
  language: string
  textSimplification: "none" | "moderate" | "high"
  symbolSupport: boolean

  // Notifications
  alertStyle: "visual" | "audio" | "haptic" | "all"
  alertDuration: number
  alertIntensity: number

  // Privacy (new)
  dataRetention: number // days
  usageAnalytics: boolean

  // Emergency (new)
  gestureSensitivity: number
  contactOrdering: "priority" | "alphabetical" | "relationship" | "recent"
}

// Default settings
export const defaultSettings: AccessibilitySettings = {
  theme: "system",
  fontSize: 100,
  fontFamily: "system-ui",
  reducedMotion: false,
  highContrast: false,

  touchTargetSize: "default",
  keyboardShortcuts: true,
  hapticFeedback: true,
  hapticIntensity: 50,

  screenReader: false,
  voiceControl: false,
  audioFeedback: true,
  audioVolume: 80,
  speechRate: 50,

  language: "en",
  textSimplification: "none",
  symbolSupport: false,

  alertStyle: "all",
  alertDuration: 5,
  alertIntensity: 50,

  // New settings
  dataRetention: 30,
  usageAnalytics: true,
  gestureSensitivity: 50,
  contactOrdering: "priority",
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void
  resetSettings: () => void
  saveSettings: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("accessibilitySettings")
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (e) {
          console.error("Failed to parse saved settings", e)
        }
      }
    }
  }, [])

  // Apply theme
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const isDark =
      settings.theme === "dark" ||
      (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    // Apply theme
    if (settings.theme === "high-contrast") {
      root.classList.add("high-contrast")
      root.classList.remove("dark")
    } else {
      root.classList.remove("high-contrast")
      if (isDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast-mode")
    } else {
      root.classList.remove("high-contrast-mode")
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduced-motion")
    } else {
      root.classList.remove("reduced-motion")
    }

    // Apply font size
    root.style.fontSize = `${settings.fontSize}%`

    // Apply font family
    root.style.fontFamily = settings.fontFamily

    // Apply touch target size
    if (settings.touchTargetSize === "large") {
      root.classList.add("large-targets")
      root.classList.remove("extra-large-targets")
    } else if (settings.touchTargetSize === "extra-large") {
      root.classList.add("extra-large-targets")
      root.classList.remove("large-targets")
    } else {
      root.classList.remove("large-targets", "extra-large-targets")
    }

    // Apply text simplification
    root.setAttribute("data-text-simplification", settings.textSimplification)
  }, [settings, mounted])

  // Update a single setting
  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Reset to defaults
  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  // Save settings
  const saveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessibilitySettings", JSON.stringify(settings))
    }
  }

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings, saveSettings }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
