"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmergencyFeedbackProps {
  isVisible: boolean
  onClose: () => void
}

export function EmergencyFeedback({ isVisible, onClose }: EmergencyFeedbackProps) {
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    if (!isVisible) return

    // Reset countdown when shown
    setCountdown(150)

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 bg-red-600 bg-opacity-95 z-50 flex flex-col items-center justify-center p-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="animate-pulse mb-6">
        <AlertTriangle className="h-24 w-24 text-white" aria-hidden="true" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-4 text-center">Emergency Help Requested</h2>

      <p className="text-xl text-white mb-8 text-center">
        Help is on the way. Please stay calm and remain where you are.
      </p>

      {/* <div className="w-full max-w-xs bg-white bg-opacity-20 rounded-full h-4 mb-8">
        <div
          className="bg-white h-4 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 15) * 100}%` }}
        ></div>
      </div> */}

      <p className="text-white mb-8">Remain Calm!</p>

      <Button onClick={onClose} className="bg-white text-red-600 hover:bg-red-100 px-8 py-3 text-lg font-bold">
        <X className="mr-2 h-5 w-5" aria-hidden="true" />
        Cancel Emergency
      </Button>
    </div>
  )
}


export function EmergencyResponse({ isVisible, onClose }: EmergencyFeedbackProps) {
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    if (!isVisible) return

    // Reset countdown when shown
    setCountdown(150)

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 bg-green-600 bg-opacity-95 z-50 flex flex-col items-center justify-center p-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="animate-pulse mb-6">
        <AlertTriangle className="h-24 w-24 text-white" aria-hidden="true" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-4 text-center">Emergency Help Requested Nearby</h2>

      <p className="text-xl text-white mb-8 text-center">
        Are you able to help?
      </p>

      {/* <div className="w-full max-w-xs bg-white bg-opacity-20 rounded-full h-4 mb-8">
        <div
          className="bg-white h-4 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 15) * 100}%` }}
        ></div>
      </div> */}

      <p className="text-white mb-8">Auto-closing in {countdown} seconds</p>

      <Button onClick={onClose} className="bg-white text-green-600 hover:bg-green-100 px-8 py-3 text-lg font-bold">
        <X className="mr-2 h-5 w-5" aria-hidden="true" />
        Answer Emergency
      </Button>
    </div>
  )
}