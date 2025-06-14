"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type VoiceNavigationContextType = {
  isListening: boolean
  toggleListening: () => void
  startListening: () => void
  stopListening: () => void
  voiceEnabled: boolean
  toggleVoiceEnabled: () => void
  voiceSpeed: number
  setVoiceSpeed: (speed: number) => void
  voiceType: string
  setVoiceType: (type: string) => void
  lastCommand: string | null
  isProcessingCommand: boolean
  showCommandOverlay: boolean
  toggleCommandOverlay: () => void
}

const VoiceNavigationContext = createContext<VoiceNavigationContextType | undefined>(undefined)

export function VoiceNavigationProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceSpeed, setVoiceSpeed] = useState(1)
  const [voiceType, setVoiceType] = useState("default")
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [isProcessingCommand, setIsProcessingCommand] = useState(false)
  const [showCommandOverlay, setShowCommandOverlay] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Load voice settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedVoiceEnabled = localStorage.getItem("voiceEnabled")
      const savedVoiceSpeed = localStorage.getItem("voiceSpeed")
      const savedVoiceType = localStorage.getItem("voiceType")

      if (savedVoiceEnabled) setVoiceEnabled(savedVoiceEnabled === "true")
      if (savedVoiceSpeed) setVoiceSpeed(Number.parseFloat(savedVoiceSpeed))
      if (savedVoiceType) setVoiceType(savedVoiceType)
    }
  }, [])

  // Save voice settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("voiceEnabled", voiceEnabled.toString())
      localStorage.setItem("voiceSpeed", voiceSpeed.toString())
      localStorage.setItem("voiceType", voiceType)
    }
  }, [voiceEnabled, voiceSpeed, voiceType])

  const toggleListening = useCallback(() => {
    if (!voiceEnabled) return

    setIsListening((prev) => {
      const newState = !prev
      if (newState) {
        toast({
          title: "Voice navigation active",
          description: "Listening for commands...",
          duration: 2000,
        })
      } else {
        toast({
          title: "Voice navigation paused",
          description: "No longer listening for commands",
          duration: 2000,
        })
      }
      return newState
    })
  }, [voiceEnabled, toast])

  const startListening = useCallback(() => {
    if (!voiceEnabled) return
    setIsListening(true)
    toast({
      title: "Voice navigation active",
      description: "Listening for commands...",
      duration: 2000,
    })
  }, [voiceEnabled, toast])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  const toggleVoiceEnabled = useCallback(() => {
    setVoiceEnabled((prev) => {
      const newState = !prev
      if (newState) {
        toast({
          title: "Voice navigation enabled",
          description: "You can now use voice commands",
          duration: 3000,
        })
      } else {
        setIsListening(false)
        toast({
          title: "Voice navigation disabled",
          description: "Voice commands are now turned off",
          duration: 3000,
        })
      }
      return newState
    })
  }, [toast])

  const toggleCommandOverlay = useCallback(() => {
    setShowCommandOverlay((prev) => !prev)
  }, [])

  // For now, we're just providing the context values
  // In a real implementation, we would add speech recognition logic here

  const value = {
    isListening,
    toggleListening,
    startListening,
    stopListening,
    voiceEnabled,
    toggleVoiceEnabled,
    voiceSpeed,
    setVoiceSpeed,
    voiceType,
    setVoiceType,
    lastCommand,
    isProcessingCommand,
    showCommandOverlay,
    toggleCommandOverlay,
  }

  return <VoiceNavigationContext.Provider value={value}>{children}</VoiceNavigationContext.Provider>
}

export function useVoiceNavigation() {
  const context = useContext(VoiceNavigationContext)
  if (context === undefined) {
    throw new Error("useVoiceNavigation must be used within a VoiceNavigationProvider")
  }
  return context
}
