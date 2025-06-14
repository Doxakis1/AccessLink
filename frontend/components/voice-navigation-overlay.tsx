"use client"

import { useVoiceNavigation } from "@/contexts/voice-navigation-context"
import { Mic, MicOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function VoiceNavigationOverlay() {
  const {
    isListening,
    toggleListening,
    voiceEnabled,
    lastCommand,
    isProcessingCommand,
    showCommandOverlay,
    toggleCommandOverlay,
  } = useVoiceNavigation()

  const [availableCommands, setAvailableCommands] = useState<string[]>([
    "Go to home",
    "Open settings",
    "Show reports",
    "Open AI assistant",
    "Go back",
    "Click button",
    "Help me",
  ])

  // In a real implementation, we would update available commands based on the current page

  if (!voiceEnabled) return null

  return (
    <>
      {/* Voice status indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant={isListening ? "default" : "outline"}
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg",
            isListening && "animate-pulse bg-green-500 hover:bg-green-600",
          )}
          onClick={toggleListening}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
      </div>

      {/* Command overlay */}
      {showCommandOverlay && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Available Voice Commands</h2>
              <Button variant="ghost" size="icon" onClick={toggleCommandOverlay}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {availableCommands.map((command, index) => (
                <div key={index} className="p-2 bg-muted rounded-md">
                  {command}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Say "Help me" or "What can I say" to see this list anytime.
            </div>
          </Card>
        </div>
      )}

      {/* Last command indicator */}
      {isListening && lastCommand && (
        <div className="fixed bottom-20 right-4 bg-background p-2 rounded-md shadow-md z-50 max-w-xs">
          <div className="text-sm font-medium">
            {isProcessingCommand ? "Processing..." : `Command: "${lastCommand}"`}
          </div>
        </div>
      )}
    </>
  )
}
