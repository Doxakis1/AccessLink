"use client"

import { useEffect } from "react"

export default function RootPage() {
  useEffect(() => {
    // Check if initial setup has been completed
    const initialSetupCompleted = localStorage.getItem("initialSetupCompleted")

    if (initialSetupCompleted === "true") {
      // If setup is completed, redirect to login
      window.location.href = "/login"
    } else {
      // If setup is not completed, redirect to initial setup
      window.location.href = "/initial-setup"
    }
  }, [])

  // Return null while checking localStorage and redirecting
  return null
}
