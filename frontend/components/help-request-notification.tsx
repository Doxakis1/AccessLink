"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, X } from "lucide-react"

interface HelpRequestNotificationProps {
  isVisible: boolean
  requesterName: string
  onAccept: () => void
  onDecline: () => void
}

export function HelpRequestNotification({
  isVisible,
  requesterName,
  onAccept,
  onDecline,
}: HelpRequestNotificationProps) {
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (!isVisible) return

    // Reset countdown when shown
    setCountdown(30)

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onDecline() // Auto-decline when timer runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible, onDecline])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 animate-pulse" aria-hidden="true" />
            Help Request
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-xl font-medium">
              <span className="font-bold">{requesterName}</span> needs your help!
            </p>
            <p>They've requested immediate assistance. Can you help them?</p>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 30) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Auto-declining in {countdown} seconds</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onDecline}>
            <X className="mr-2 h-4 w-4" />
            Decline
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={onAccept}>
            <Phone className="mr-2 h-4 w-4" />
            Accept
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
