"use client"

import { useEffect } from "react"
import { useTutorial } from "@/contexts/tutorial-context"

export function WelcomeTutorial() {
  const { startTutorial, isTutorialComplete } = useTutorial()

  useEffect(() => {
    // Check if this is the first time the user is visiting the home page
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")

    if (!hasSeenWelcome && !isTutorialComplete("navigation")) {
      // Start the navigation tutorial after a short delay
      const timer = setTimeout(() => {
        startTutorial("navigation")
        localStorage.setItem("hasSeenWelcome", "true")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [startTutorial, isTutorialComplete])

  return null
}
