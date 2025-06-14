"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Check, ChevronLeft, ChevronRight, Sun, Moon, Monitor, Smartphone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StatusAnnouncer } from "@/components/status-announcer"
import { SkipLink } from "@/components/skip-link"

// Define the accessibility settings interface
interface AccessibilitySettings {
  theme: "light" | "dark" | "system" | "high-contrast"
  fontSize: number
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
}

export default function InitialSetupWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Accessibility settings state
  const [settings, setSettings] = useState<AccessibilitySettings>({
    theme: "system",
    fontSize: 100,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  })

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Check if initial setup has been completed
    const initialSetupCompleted = localStorage.getItem("initialSetupCompleted")
    if (initialSetupCompleted === "true") {
      router.push("/login")
    }
  }, [router])

  // Define the steps of the wizard
  const steps = [
    { id: "welcome", title: "Welcome", icon: <Monitor className="h-6 w-6" /> },
    { id: "visual", title: "Visual", icon: <Eye className="h-6 w-6" /> },
    { id: "complete", title: "Complete", icon: <Check className="h-6 w-6" /> },
  ]

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setStatusMessage(`Step ${currentStep + 2} of ${steps.length}: ${steps[currentStep + 1].title}`)
      window.scrollTo(0, 0)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setStatusMessage(`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1].title}`)
      window.scrollTo(0, 0)
    }
  }

  // Handle skip to login
  const handleSkip = () => {
    saveSettings()
    saveProfile()
    markSetupCompleted()
    router.push("/login")
  }

  // Handle completion
  const handleComplete = () => {
    saveSettings()
    saveProfile()
    markSetupCompleted()

    setStatusMessage("Setup complete! Redirecting to login page.")
    setTimeout(() => {
      router.push("/login")
    }, 1500)
  }

  // Save profile to localStorage
  const saveProfile = () => {
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        displayName: "",
        avatar: null,
        language: "en",
        location: "",
        accessibilityNeeds: "",
        bio: "",
      }),
    )
  }

  // Save accessibility settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings))
  }

  // Mark initial setup as completed
  const markSetupCompleted = () => {
    localStorage.setItem("initialSetupCompleted", "true")
  }

  // Update accessibility settings
  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [key]: value,
      }

      // Apply changes immediately
      applyVisualSettings(newSettings)

      return newSettings
    })
  }

  // Function to apply visual settings in real-time
  const applyVisualSettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement

    // Apply theme
    const isDark =
      settings.theme === "dark" ||
      (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (settings.theme === "high-contrast") {
      root.classList.add("high-contrast")
      root.classList.remove("dark")
    } else {
      root.classList.remove("high-contrast")
      if (isDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast-mode")
    } else {
      root.classList.remove("high-contrast-mode")
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduced-motion")
    } else {
      root.classList.remove("reduced-motion")
    }

    // Apply font size
    root.style.fontSize = `${settings.fontSize}%`
  }

  // Apply settings on mount
  useEffect(() => {
    if (mounted) {
      applyVisualSettings(settings)
    }
  }, [mounted, settings])

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  if (!mounted) return null

  return (
    <>
      <SkipLink />
      <StatusAnnouncer message={statusMessage} />

      <main id="main-content" className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4" tabIndex={-1}>
        <div className="container max-w-3xl mx-auto py-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Step {currentStep + 1} of {steps.length}
              </h2>
              {currentStep < steps.length - 1 && (
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-sm">
                  Skip setup
                </Button>
              )}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                role="progressbar"
                aria-valuenow={((currentStep + 1) / steps.length) * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"
                  }`}
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      index <= currentStep ? "bg-blue-100 dark:bg-blue-900" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <Card className="border-2">
            {/* Welcome Step */}
            {currentStep === 0 && (
              <>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl md:text-3xl">Welcome to AccessLink</CardTitle>
                  <CardDescription className="text-lg">Let's set up your accessibility preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Smartphone className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p>
                      Before you create an account, let's customize the app to meet your specific accessibility needs.
                    </p>
                    <p>We'll guide you through setting up your visual preferences.</p>
                    <p className="font-medium">You can change these settings at any time after logging in.</p>
                  </div>
                </CardContent>
              </>
            )}

            {/* Visual Settings Step */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    Visual Settings
                  </CardTitle>
                  <CardDescription>Customize how content appears on your screen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="theme-select" className="text-lg font-medium">
                      Theme
                    </Label>
                    <RadioGroup
                      value={settings.theme}
                      onValueChange={(value) => updateSetting("theme", value as any)}
                      className="grid grid-cols-4 gap-4"
                    >
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                        <Label htmlFor="theme-system" className="cursor-pointer flex flex-col items-center">
                          <Monitor className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>System</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                        <Label htmlFor="theme-light" className="cursor-pointer flex flex-col items-center">
                          <Sun className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Light</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                        <Label htmlFor="theme-dark" className="cursor-pointer flex flex-col items-center">
                          <Moon className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Dark</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="high-contrast" id="theme-high-contrast" className="sr-only" />
                        <Label htmlFor="theme-high-contrast" className="cursor-pointer flex flex-col items-center">
                          <Eye className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>High Contrast</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="font-size-slider" className="text-lg font-medium">
                        Text Size
                      </Label>
                      <span className="text-sm font-medium" aria-hidden="true">
                        {settings.fontSize}%
                      </span>
                    </div>
                    <Slider
                      id="font-size-slider"
                      min={75}
                      max={200}
                      step={5}
                      value={[settings.fontSize]}
                      onValueChange={(value) => updateSetting("fontSize", value[0])}
                      aria-label={`Text size: ${settings.fontSize}%`}
                      aria-valuemin={75}
                      aria-valuemax={200}
                      aria-valuenow={settings.fontSize}
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>A</span>
                      <span>A</span>
                      <span className="text-base">A</span>
                      <span className="text-lg">A</span>
                      <span className="text-xl">A</span>
                    </div>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast-toggle" className="text-lg font-medium">
                        High Contrast Mode
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Enhance visual distinction between elements
                      </p>
                    </div>
                    <Switch
                      id="high-contrast-toggle"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                      aria-label="Toggle high contrast mode"
                    />
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduced-motion-toggle" className="text-lg font-medium">
                        Reduced Motion
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Minimize animations and transitions</p>
                    </div>
                    <Switch
                      id="reduced-motion-toggle"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                      aria-label="Toggle reduced motion"
                    />
                  </div>

                  {/* Screen Reader */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="screen-reader-toggle" className="text-lg font-medium">
                        Screen Reader Support
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Optimize for screen readers</p>
                    </div>
                    <Switch
                      id="screen-reader-toggle"
                      checked={settings.screenReader}
                      onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                      aria-label="Toggle screen reader support"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Completion Step */}
            {currentStep === 2 && (
              <>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl md:text-3xl">Setup Complete!</CardTitle>
                  <CardDescription className="text-lg">Your preferences have been saved</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p>You've successfully set up your initial accessibility preferences.</p>
                    <p>Now you can create an account or log in to continue.</p>
                    <p className="font-medium">Click "Continue to Login" to proceed.</p>
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Previous</span>
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <span>Continue to Login</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  )
}
