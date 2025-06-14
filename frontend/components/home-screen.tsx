"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Phone, MessageSquareText, Cpu, BarChart3, Settings, Accessibility, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"
import { StatusAnnouncer } from "@/components/status-announcer"
import { SkipLink } from "@/components/skip-link"
import { useRouter } from "next/navigation"
import { EmergencyFeedback } from "@/components/emergency-feedback"
import { QuickSettingsMenu } from "@/components/quick-settings-menu"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { HelpRequestNotification } from "@/components/help-request-notification"
import { TutorialButton } from "@/components/tutorial-button"
import { useUser } from "@/contexts/user-context"

export default function HomeScreen() {
  const router = useRouter()
  const isMobile = useMobile()
  const [mounted, setMounted] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false)
  const [showHelpRequest, setShowHelpRequest] = useState(false)
  const [requesterName, setRequesterName] = useState("John")

  const { user, logout, updateAvailability, sendDistressSignal, updateLocation } = useUser()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get user's location on mount
  useEffect(() => {
    if (user.isLoggedIn && !user.location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation(position.coords.latitude.toString(), position.coords.longitude.toString())
        },
        (error) => {
          console.error("Failed to get location:", error)
        },
      )
    }
  }, [user.isLoggedIn, user.location, updateLocation])

  // Handle button actions and set status messages for screen readers
  const handleAction = async (action: string) => {
    setStatusMessage(`${action} selected.`)

    // Handle direct call for help
    if (action === "Call for Help") {
      const success = await sendDistressSignal()
      if (success) {
        setEmergencyMode(true)
        setStatusMessage("Emergency assistance requested. Help is on the way.")
      }
      return
    }

    // For other actions, navigate as before
    setStatusMessage(`Opening ${action}.`)
    switch (action) {
      case "AI Assistant":
        router.push("/ai-assistant")
        break
      case "Settings":
        router.push("/settings")
        break
      case "Login":
        router.push("/")
        break
      case "Gadgets":
        router.push("/gadgets")
        break
      case "Reports":
        router.push("/reports")
        break
      default:
        // For other actions, just show a status message for now
        setTimeout(() => {
          setStatusMessage(null)
        }, 3000)
    }
  }

  const toggleQuickSettings = () => {
    setQuickSettingsOpen(!quickSettingsOpen)
    setStatusMessage(quickSettingsOpen ? "User settings closed" : "User settings opened")
  }

  const handleAcceptHelp = () => {
    setShowHelpRequest(false)
    toast({
      title: "Help request accepted",
      description: `You are now connected with ${requesterName}`,
    })
    // In a real app, this would initiate a connection with the requester
  }

  const handleDeclineHelp = () => {
    setShowHelpRequest(false)
    toast({
      title: "Help request declined",
      description: "You have declined the help request",
    })
  }

  const toggleAvailability = async (checked: boolean) => {
    const success = await updateAvailability(checked)
    if (success) {
      setStatusMessage(
        checked
          ? "You are now available to receive help requests"
          : "You are no longer available to receive help requests",
      )

      // Simulate receiving a help request after becoming available (for demo purposes)
      if (checked) {
        setTimeout(() => {
          setRequesterName(["John", "Sarah", "Miguel", "Emma"][Math.floor(Math.random() * 4)])
          setShowHelpRequest(true)
        }, 5000)
      }

      setTimeout(() => {
        setStatusMessage(null)
      }, 3000)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!mounted) return null

  return (
    <>
      <SkipLink />
      <StatusAnnouncer message={statusMessage} />

      <main id="main-content" className="min-h-screen bg-slate-50 dark:bg-slate-900" tabIndex={-1}>
        <div className="container px-4 py-8 mx-auto">
          {/* Header with buttons in top corners */}
          <header className="mb-8 relative">
            {/* Left settings button */}
            <div className="absolute top-0 left-0">
              <Button
                variant="outline"
                size="lg"
                onClick={toggleQuickSettings}
                aria-label="User Settings"
                aria-expanded={quickSettingsOpen}
                aria-haspopup="dialog"
                className="min-w-[48px] min-h-[48px] p-3 rounded-lg border-2 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings className="w-6 h-6" aria-hidden="true" />
              </Button>
            </div>

            {/* Right accessibility button */}
            <div className="absolute top-0 right-0">
              <Button
                variant="default"
                size="lg"
                onClick={() => handleAction("Settings")}
                aria-label="Accessibility Settings"
                className="min-w-[48px] min-h-[48px] p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Accessibility className="w-6 h-6" />
              </Button>
            </div>

            <div className="text-center pt-14">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                {"AccessLink"}
              </h1>
              <p className="mt-2 text-xl text-slate-700 dark:text-slate-300" id="page-description">
                Welcome back, {user.name || user.email}
              </p>

              <div className="flex items-center justify-center mt-4 space-x-2">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.isAvailable
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {user.isAvailable ? "Available to help others" : "Unavailable to help"}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="availability-toggle"
                    checked={user.isAvailable}
                    onCheckedChange={toggleAvailability}
                    aria-label={
                      user.isAvailable ? "Set yourself as unavailable to help" : "Set yourself as available to help"
                    }
                  />
                </div>
              </div>
            </div>
          </header>

          <nav aria-labelledby="page-description">
            <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2"} max-w-3xl mx-auto`} role="menu">
              <ActionButton
                icon={<Phone className="w-8 h-8" aria-hidden="true" />}
                label="Call for Help"
                description="Request immediate assistance"
                color="bg-red-700 hover:bg-red-800 focus-visible:ring-red-500"
                onClick={() => handleAction("Call for Help")}
                shortcutKey="1"
              />

              <ActionButton
                icon={<MessageSquareText className="w-8 h-8" aria-hidden="true" />}
                label="AI Assistant"
                description="Chat with your virtual assistant"
                color="bg-emerald-700 hover:bg-emerald-800 focus-visible:ring-emerald-500"
                onClick={() => handleAction("AI Assistant")}
                shortcutKey="2"
              />

              <ActionButton
                icon={<Cpu className="w-8 h-8" aria-hidden="true" />}
                label="Gadgets"
                description="Manage your connected devices"
                color="bg-amber-700 hover:bg-amber-800 focus-visible:ring-amber-500"
                onClick={() => handleAction("Gadgets")}
                shortcutKey="3"
              />

              <ActionButton
                icon={<BarChart3 className="w-8 h-8" aria-hidden="true" />}
                label="Reports"
                description="View your activity reports"
                color="bg-purple-700 hover:bg-purple-800 focus-visible:ring-purple-500"
                onClick={() => handleAction("Reports")}
                shortcutKey="4"
              />
            </div>
          </nav>

          <footer className="mt-12 flex flex-col items-center gap-4">
            <TutorialButton />
            <Button
              variant="outline"
              className="flex items-center gap-2 min-h-[44px] px-6"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Log out</span>
            </Button>
          </footer>
        </div>
      </main>

      {/* User Settings Dialog */}
      <QuickSettingsMenu isOpen={quickSettingsOpen} onClose={() => setQuickSettingsOpen(false)} />

      <EmergencyFeedback
        isVisible={emergencyMode}
        onClose={() => {
          setEmergencyMode(false)
          setStatusMessage("Emergency request cancelled.")
          setTimeout(() => setStatusMessage(null), 3000)
        }}
      />
      <HelpRequestNotification
        isVisible={showHelpRequest}
        requesterName={requesterName}
        onAccept={handleAcceptHelp}
        onDecline={handleDeclineHelp}
      />
    </>
  )
}

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  description: string
  color: string
  onClick: () => void
  shortcutKey: string
}

function ActionButton({ icon, label, description, color, onClick, shortcutKey }: ActionButtonProps) {
  // Add keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortcutKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        onClick()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcutKey, onClick])

  // Special handling for Call for Help button
  const isEmergencyButton = label === "Call for Help"

  return (
    <div className="relative" role="menuitem">
      <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-800">
        <Button
          className={`w-full h-full p-6 flex flex-col items-center justify-center gap-3 text-white ${color} rounded-none ${
            isEmergencyButton ? "animate-pulse" : ""
          }`}
          onClick={onClick}
          aria-label={`${label}: ${description}`}
          style={{ minHeight: "180px" }}
        >
          <div className="p-3 bg-white/20 rounded-full" aria-hidden="true">
            {icon}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{label}</div>
            <div className="mt-1 text-lg font-medium text-white/90">
              {isEmergencyButton ? "Single tap for immediate help" : description}
            </div>
          </div>
        </Button>
      </Card>
      <span
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white/30 rounded text-white text-sm font-bold"
        aria-hidden="true"
      >
        {shortcutKey}
      </span>
    </div>
  )
}
