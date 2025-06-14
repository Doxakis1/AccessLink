"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechOptions {
  voice?: SpeechSynthesisVoice
  pitch?: number
  rate?: number
  volume?: number
  onEnd?: () => void
}

interface SpeechSynthesisHook {
  speak: (text: string, options?: SpeechOptions) => void
  stop: () => void
  speaking: boolean
  supported: boolean
  voices: SpeechSynthesisVoice[]
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true)

      // Get available voices
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices())
      }

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices
      }

      updateVoices()

      // Clean up
      return () => {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback(
    (text: string, options: SpeechOptions = {}) => {
      if (!supported) return

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text)

      // Set options
      if (options.voice) utterance.voice = options.voice
      if (options.pitch) utterance.pitch = options.pitch
      if (options.rate) utterance.rate = options.rate
      if (options.volume) utterance.volume = options.volume

      // Set default voice (preferably a female voice)
      if (!options.voice && voices.length > 0) {
        // Try to find a female English voice
        const femaleVoice = voices.find((voice) => voice.lang.includes("en") && voice.name.includes("Female"))
        const englishVoice = voices.find((voice) => voice.lang.includes("en"))
        utterance.voice = femaleVoice || englishVoice || voices[0]
      }

      // Set default rate if not specified
      if (!options.rate) {
        utterance.rate = 1.0 // Normal speed
      }

      // Handle events
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => {
        setSpeaking(false)
        if (options.onEnd) options.onEnd()
      }
      utterance.onerror = () => {
        setSpeaking(false)
        if (options.onEnd) options.onEnd()
      }

      // Speak
      window.speechSynthesis.speak(utterance)
    },
    [supported, voices],
  )

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { speak, stop, speaking, supported, voices }
}
