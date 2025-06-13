"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechRecognitionHook {
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  transcript: string
  resetTranscript: () => void
  browserSupportsSpeechRecognition: boolean
}

// Define types for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onerror: (event: Event) => void
  onresult: (event: SpeechRecognitionEvent) => void
  onend: (event: Event) => void
}

// Define the global SpeechRecognition constructor
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + " "
            }
          }

          if (currentTranscript) {
            setTranscript(currentTranscript.trim())
          }
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error", event)
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
        setBrowserSupportsSpeechRecognition(true)
      } else {
        setBrowserSupportsSpeechRecognition(false)
      }
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.start()
        setIsListening(true)
        setTranscript("")
      } catch (error) {
        console.error("Error starting speech recognition:", error)
      }
    }
  }, [recognition])

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  }
}
