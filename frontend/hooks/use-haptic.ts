"use client"

import { useAccessibility } from "@/contexts/accessibility-context"

type HapticIntensity = "light" | "medium" | "heavy"

export function useHaptic() {
  const { settings } = useAccessibility()

  const triggerHaptic = (intensity: HapticIntensity = "medium") => {
    if (!settings.hapticFeedback) return

    // Check if vibration API is available
    if (!window.navigator.vibrate) return

    // Calculate vibration duration based on settings and intensity
    const baseIntensity = settings.hapticIntensity / 100

    let duration = 0
    switch (intensity) {
      case "light":
        duration = Math.round(20 * baseIntensity)
        break
      case "medium":
        duration = Math.round(40 * baseIntensity)
        break
      case "heavy":
        duration = Math.round(80 * baseIntensity)
        break
    }

    // Trigger vibration
    window.navigator.vibrate(duration)
  }

  return { triggerHaptic }
}
