"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Eye, Hand, Volume2, Globe, Bell, Save, RotateCcw, Check, Sliders, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusAnnouncer } from "@/components/status-announcer"
import { SkipLink } from "@/components/skip-link"
import { SuccessBanner } from "@/components/success-banner"
import { useAccessibility } from "@/contexts/accessibility-context"

export default function SettingsPage() {
  const router = useRouter()
  const { settings, updateSetting, resetSettings, saveSettings } = useAccessibility()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle save settings
  const handleSaveSettings = () => {
    saveSettings()
    setStatusMessage("Settings saved successfully")
    setShowSuccessBanner(true)
  }

  // Handle reset settings
  const handleResetSettings = () => {
    resetSettings()
    setStatusMessage("Settings reset to defaults")
    setTimeout(() => setStatusMessage(null), 2000)
  }

  const handleCloseBanner = () => {
    setShowSuccessBanner(false)
  }

  if (!mounted) return null

  return (
    <>
      <SkipLink />
      <StatusAnnouncer message={statusMessage} />
      <SuccessBanner message="Settings saved successfully" isVisible={showSuccessBanner} onClose={handleCloseBanner} />

      <main id="main-content" className="min-h-screen bg-slate-50 dark:bg-slate-900" tabIndex={-1}>
        <div className="container px-4 py-8 mx-auto max-w-4xl">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => router.push("/")}
                aria-label="Return to home screen"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                <span>Back</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleResetSettings}
                  aria-label="Reset all settings to default values"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Reset</span>
                </Button>

                <Button className="flex items-center gap-2" onClick={handleSaveSettings} aria-label="Save all settings">
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>Save</span>
                </Button>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
              Accessibility Settings
            </h1>
            <p className="mt-2 text-xl text-slate-700 dark:text-slate-300">
              Customize your experience to meet your needs
            </p>
          </header>

          <Tabs defaultValue="visual" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2" aria-label="Settings categories">
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <Eye className="w-4 h-4" aria-hidden="true" />
                <span>Visual</span>
              </TabsTrigger>
              <TabsTrigger value="interaction" className="flex items-center gap-2">
                <Hand className="w-4 h-4" aria-hidden="true" />
                <span>Interaction</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>Audio</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>Language</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" aria-hidden="true" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>

            {/* Visual Settings */}
            <TabsContent value="visual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" aria-hidden="true" />
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
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => updateSetting("theme", value as any)}
                      aria-label="Select theme"
                    >
                      <SelectTrigger id="theme-select" className="w-full">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Default</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="high-contrast">High Contrast</SelectItem>
                      </SelectContent>
                    </Select>
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

                  {/* Font Family */}
                  <div className="space-y-3">
                    <Label htmlFor="font-family-select" className="text-lg font-medium">
                      Font
                    </Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) => updateSetting("fontFamily", value)}
                      aria-label="Select font family"
                    >
                      <SelectTrigger id="font-family-select" className="w-full">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system-ui">System Default</SelectItem>
                        <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        <SelectItem value="'OpenDyslexic', sans-serif">OpenDyslexic</SelectItem>
                        <SelectItem value="'Arial', sans-serif">Arial</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interaction Settings */}
            <TabsContent value="interaction" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hand className="w-5 h-5" aria-hidden="true" />
                    Interaction Settings
                  </CardTitle>
                  <CardDescription>Customize how you interact with the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Touch Target Size */}
                  <div className="space-y-3">
                    <Label htmlFor="touch-target-size" className="text-lg font-medium">
                      Touch Target Size
                    </Label>
                    <RadioGroup
                      id="touch-target-size"
                      value={settings.touchTargetSize}
                      onValueChange={(value) => updateSetting("touchTargetSize", value as any)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="target-default" />
                        <Label htmlFor="target-default">Default</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="target-large" />
                        <Label htmlFor="target-large">Large</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="extra-large" id="target-extra-large" />
                        <Label htmlFor="target-extra-large">Extra Large</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="keyboard-shortcuts-toggle" className="text-lg font-medium">
                        Keyboard Shortcuts
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Enable keyboard shortcuts for quick navigation
                      </p>
                    </div>
                    <Switch
                      id="keyboard-shortcuts-toggle"
                      checked={settings.keyboardShortcuts}
                      onCheckedChange={(checked) => updateSetting("keyboardShortcuts", checked)}
                      aria-label="Toggle keyboard shortcuts"
                    />
                  </div>

                  {/* Haptic Feedback */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="haptic-feedback-toggle" className="text-lg font-medium">
                        Haptic Feedback
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Enable vibration feedback on interactions
                      </p>
                    </div>
                    <Switch
                      id="haptic-feedback-toggle"
                      checked={settings.hapticFeedback}
                      onCheckedChange={(checked) => updateSetting("hapticFeedback", checked)}
                      aria-label="Toggle haptic feedback"
                    />
                  </div>

                  {/* Haptic Intensity */}
                  {settings.hapticFeedback && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="haptic-intensity-slider" className="text-lg font-medium">
                          Haptic Intensity
                        </Label>
                        <span className="text-sm font-medium" aria-hidden="true">
                          {settings.hapticIntensity}%
                        </span>
                      </div>
                      <Slider
                        id="haptic-intensity-slider"
                        min={0}
                        max={100}
                        step={10}
                        value={[settings.hapticIntensity]}
                        onValueChange={(value) => updateSetting("hapticIntensity", value[0])}
                        aria-label={`Haptic intensity: ${settings.hapticIntensity}%`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={settings.hapticIntensity}
                        disabled={!settings.hapticFeedback}
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Gentle</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audio & Speech Settings */}
            <TabsContent value="audio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" aria-hidden="true" />
                    Audio & Speech Settings
                  </CardTitle>
                  <CardDescription>Customize audio feedback and speech options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  {/* Voice Control */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="voice-control-toggle" className="text-lg font-medium">
                        Voice Control
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Control the app using voice commands</p>
                    </div>
                    <Switch
                      id="voice-control-toggle"
                      checked={settings.voiceControl}
                      onCheckedChange={(checked) => updateSetting("voiceControl", checked)}
                      aria-label="Toggle voice control"
                    />
                  </div>

                  {/* Audio Feedback */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="audio-feedback-toggle" className="text-lg font-medium">
                        Audio Feedback
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Play sounds on actions and events</p>
                    </div>
                    <Switch
                      id="audio-feedback-toggle"
                      checked={settings.audioFeedback}
                      onCheckedChange={(checked) => updateSetting("audioFeedback", checked)}
                      aria-label="Toggle audio feedback"
                    />
                  </div>

                  {/* Audio Volume */}
                  {settings.audioFeedback && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="audio-volume-slider" className="text-lg font-medium">
                          Audio Volume
                        </Label>
                        <span className="text-sm font-medium" aria-hidden="true">
                          {settings.audioVolume}%
                        </span>
                      </div>
                      <Slider
                        id="audio-volume-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[settings.audioVolume]}
                        onValueChange={(value) => updateSetting("audioVolume", value[0])}
                        aria-label={`Audio volume: ${settings.audioVolume}%`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={settings.audioVolume}
                        disabled={!settings.audioFeedback}
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Quiet</span>
                        <span>Loud</span>
                      </div>
                    </div>
                  )}

                  {/* Speech Rate */}
                  {(settings.screenReader || settings.voiceControl) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="speech-rate-slider" className="text-lg font-medium">
                          Speech Rate
                        </Label>
                        <span className="text-sm font-medium" aria-hidden="true">
                          {settings.speechRate}%
                        </span>
                      </div>
                      <Slider
                        id="speech-rate-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[settings.speechRate]}
                        onValueChange={(value) => updateSetting("speechRate", value[0])}
                        aria-label={`Speech rate: ${settings.speechRate}%`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={settings.speechRate}
                        disabled={!settings.screenReader && !settings.voiceControl}
                      />
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Language & Communication Settings */}
            <TabsContent value="language" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" aria-hidden="true" />
                    Language & Communication
                  </CardTitle>
                  <CardDescription>Customize language and text preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Language Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="language-select" className="text-lg font-medium">
                      Language
                    </Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => updateSetting("language", value)}
                      aria-label="Select language"
                    >
                      <SelectTrigger id="language-select" className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Text Simplification */}
                  <div className="space-y-3">
                    <Label htmlFor="text-simplification" className="text-lg font-medium">
                      Text Simplification
                    </Label>
                    <RadioGroup
                      id="text-simplification"
                      value={settings.textSimplification}
                      onValueChange={(value) => updateSetting("textSimplification", value as any)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="simplify-none" />
                        <Label htmlFor="simplify-none">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="simplify-moderate" />
                        <Label htmlFor="simplify-moderate">Moderate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="simplify-high" />
                        <Label htmlFor="simplify-high">High</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Symbol Support */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="symbol-support-toggle" className="text-lg font-medium">
                        Symbol Support
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Show symbols alongside text for better understanding
                      </p>
                    </div>
                    <Switch
                      id="symbol-support-toggle"
                      checked={settings.symbolSupport}
                      onCheckedChange={(checked) => updateSetting("symbolSupport", checked)}
                      aria-label="Toggle symbol support"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" aria-hidden="true" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Customize how you receive alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Alert Style */}
                  <div className="space-y-3">
                    <Label htmlFor="alert-style" className="text-lg font-medium">
                      Alert Style
                    </Label>
                    <RadioGroup
                      id="alert-style"
                      value={settings.alertStyle}
                      onValueChange={(value) => updateSetting("alertStyle", value as any)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="visual" id="alert-visual" className="sr-only" />
                        <Label htmlFor="alert-visual" className="cursor-pointer flex flex-col items-center">
                          <Monitor className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Visual Only</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="audio" id="alert-audio" className="sr-only" />
                        <Label htmlFor="alert-audio" className="cursor-pointer flex flex-col items-center">
                          <Volume2 className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Audio Only</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="haptic" id="alert-haptic" className="sr-only" />
                        <Label htmlFor="alert-haptic" className="cursor-pointer flex flex-col items-center">
                          <Hand className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>Haptic Only</span>
                        </Label>
                      </div>
                      <div className="flex flex-col items-center space-y-2 border rounded-md p-4">
                        <RadioGroupItem value="all" id="alert-all" className="sr-only" />
                        <Label htmlFor="alert-all" className="cursor-pointer flex flex-col items-center">
                          <Sliders className="w-8 h-8 mb-2" aria-hidden="true" />
                          <span>All Methods</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Alert Duration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alert-duration-slider" className="text-lg font-medium">
                        Alert Duration
                      </Label>
                      <span className="text-sm font-medium" aria-hidden="true">
                        {settings.alertDuration} seconds
                      </span>
                    </div>
                    <Slider
                      id="alert-duration-slider"
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.alertDuration]}
                      onValueChange={(value) => updateSetting("alertDuration", value[0])}
                      aria-label={`Alert duration: ${settings.alertDuration} seconds`}
                      aria-valuemin={1}
                      aria-valuemax={10}
                      aria-valuenow={settings.alertDuration}
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Brief</span>
                      <span>Extended</span>
                    </div>
                  </div>

                  {/* Alert Intensity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alert-intensity-slider" className="text-lg font-medium">
                        Alert Intensity
                      </Label>
                      <span className="text-sm font-medium" aria-hidden="true">
                        {settings.alertIntensity}%
                      </span>
                    </div>
                    <Slider
                      id="alert-intensity-slider"
                      min={10}
                      max={100}
                      step={10}
                      value={[settings.alertIntensity]}
                      onValueChange={(value) => updateSetting("alertIntensity", value[0])}
                      aria-label={`Alert intensity: ${settings.alertIntensity}%`}
                      aria-valuemin={10}
                      aria-valuemax={100}
                      aria-valuenow={settings.alertIntensity}
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtle</span>
                      <span>Prominent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between mt-8 px-0">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push("/")}
              aria-label="Cancel and return to home screen"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Cancel</span>
            </Button>

            <Button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 focus-visible:ring-green-500"
              onClick={handleSaveSettings}
              aria-label="Save all settings and return to home screen"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Save & Apply</span>
            </Button>
          </CardFooter>
        </div>
      </main>
    </>
  )
}
