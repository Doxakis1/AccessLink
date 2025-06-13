"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessBannerProps {
  message: string
  isVisible: boolean
  onClose: () => void
  autoHideDuration?: number
}

export function SuccessBanner({ message, isVisible, onClose, autoHideDuration = 3000 }: SuccessBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isVisible) {
      // Store the currently focused element before shifting focus
      previousFocusRef.current = document.activeElement as HTMLElement

      // Set a timeout to auto-hide the banner
      const timer = setTimeout(() => {
        onClose()
      }, autoHideDuration)

      // Focus the banner for screen readers
      if (bannerRef.current) {
        bannerRef.current.focus()
      }

      return () => {
        clearTimeout(timer)
      }
    } else if (previousFocusRef.current) {
      // Return focus to the previous element when banner closes
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isVisible, onClose, autoHideDuration])

  if (!isVisible) return null

  return (
    <div
      ref={bannerRef}
      role="status"
      aria-live="polite"
      tabIndex={-1}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-green-600 text-white shadow-md"
      style={{ outline: "none" }}
    >
      <div className="flex items-center space-x-3">
        <CheckCircle2 className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium text-lg">{message}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
