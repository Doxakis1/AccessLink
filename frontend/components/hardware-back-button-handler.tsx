"use client"

import { useHardwareBackButton } from "@/hooks/use-hardware-back-button"

export function HardwareBackButtonHandler() {
  // This component doesn't render anything, it just sets up the hardware back button handler
  useHardwareBackButton()
  return null
}
