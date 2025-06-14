"use client"

import { useEffect } from "react"
import { useNavigation } from "@/contexts/navigation-context"

export function useHardwareBackButton() {
  const { navigateBack } = useNavigation()

  useEffect(() => {
    // Handle hardware back button on Android devices
    const handleBackButton = () => {
      // The Capacitor plugin would be used here in a real app
      // For now, we'll just call our navigateBack function
      navigateBack()
      return true // Prevent default behavior
    }

    // In a real app with Capacitor, we would use:
    // App.addListener('backButton', handleBackButton)

    // For this demo, we'll use the browser's popstate event
    const handlePopState = () => {
      navigateBack()
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      // App.removeListener('backButton', handleBackButton)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [navigateBack])
}
