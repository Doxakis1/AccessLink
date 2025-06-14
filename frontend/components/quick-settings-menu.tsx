"use client"

import { useEffect, useRef } from "react"
import { X, User, Shield, FileText, HelpCircle, LogOut, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface QuickSettingsMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickSettingsMenu({ isOpen, onClose }: QuickSettingsMenuProps) {
  const router = useRouter()
  const { toast } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      // Focus the first element when opened
      setTimeout(() => {
        firstFocusableRef.current?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])

  // Handle tab key trap
  useEffect(() => {
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === firstFocusableRef.current) {
          event.preventDefault()
          lastFocusableRef.current?.focus()
        } else if (!event.shiftKey && document.activeElement === lastFocusableRef.current) {
          event.preventDefault()
          firstFocusableRef.current?.focus()
        }
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleTabKey)
    }

    return () => {
      document.removeEventListener("keydown", handleTabKey)
    }
  }, [isOpen])

  // Handle logout
  const handleLogout = () => {
    // Close the menu
    onClose()

    // Show toast notification
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })

    // Redirect to login page
    router.push("/")
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-start"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        ref={menuRef}
        className="bg-white dark:bg-slate-900 w-full max-w-md h-full overflow-y-auto shadow-lg animate-in slide-in-from-left duration-300"
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <h2 id="settings-title" className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5" aria-hidden="true" />
            Settings
          </h2>
          <Button
            ref={firstFocusableRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close settings menu"
            className="h-10 w-10 rounded-full"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="p-4">
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid grid-cols-4 gap-1" aria-label="Settings categories">
              <TabsTrigger value="account" className="flex flex-col items-center gap-1 py-2">
                <User className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs">Account</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex flex-col items-center gap-1 py-2">
                <Shield className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="legal" className="flex flex-col items-center gap-1 py-2">
                <FileText className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs">Legal</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex flex-col items-center gap-1 py-2">
                <HelpCircle className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs">Help</span>
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    JD
                  </div>
                  <div>
                    <h3 className="font-medium">John Doe</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">john.doe@example.com</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/profile")}
                >
                  <div>
                    <div className="font-medium">Edit Profile</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Update your personal information</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/change-password")}
                >
                  <div>
                    <div className="font-medium">Change Password</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Update your password</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/notifications")}
                >
                  <div>
                    <div className="font-medium">Notification Preferences</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Manage how we contact you</div>
                  </div>
                </Button>

                {/* Add Social Accounts Section */}
                <div className="border rounded-lg p-4 mt-4">
                  <h4 className="font-medium mb-3">Connected Accounts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Google</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>

                <Button variant="destructive" className="w-full mt-6 flex items-center gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Log Out</span>
                </Button>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              {/* Data Retention */}
              <div className="space-y-3">
                <Label htmlFor="data-retention" className="text-base font-medium">
                  Data Retention Period
                </Label>
                <Select
                  defaultValue="30"
                  onValueChange={(value) => console.log(value)}
                  aria-label="Select data retention period"
                >
                  <SelectTrigger id="data-retention" className="w-full">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">How long we keep your activity data</p>
              </div>

              {/* Usage Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="usage-analytics" className="text-base font-medium">
                    Usage Analytics
                  </Label>
                  <p className="text-sm text-slate-500">Share anonymous usage data to help improve our services</p>
                </div>
                <Switch
                  id="usage-analytics"
                  defaultChecked={true}
                  onCheckedChange={(checked) => console.log(checked)}
                  aria-label="Toggle usage analytics"
                />
              </div>

              {/* Location Services */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="location-services" className="text-base font-medium">
                    Location Services
                  </Label>
                  <p className="text-sm text-slate-500">Allow app to access your location</p>
                </div>
                <Switch
                  id="location-services"
                  defaultChecked={true}
                  onCheckedChange={(checked) => console.log(checked)}
                  aria-label="Toggle location services"
                />
              </div>

              {/* Marketing Communications */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-comms" className="text-base font-medium">
                    Marketing Communications
                  </Label>
                  <p className="text-sm text-slate-500">Receive updates about new features and offers</p>
                </div>
                <Switch
                  id="marketing-comms"
                  defaultChecked={false}
                  onCheckedChange={(checked) => console.log(checked)}
                  aria-label="Toggle marketing communications"
                />
              </div>

              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 mt-4"
                onClick={() => router.push("/data-export")}
              >
                <div>
                  <div className="font-medium">Export Your Data</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Download a copy of your personal data
                  </div>
                </div>
              </Button>

              <Button
                variant="destructive"
                className="w-full flex items-center gap-2"
                onClick={() => router.push("/delete-account")}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Delete Account</span>
              </Button>
            </TabsContent>

            {/* Legal Settings */}
            <TabsContent value="legal" className="space-y-6">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/terms")}
                >
                  <div>
                    <div className="font-medium">Terms of Service</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Read our terms and conditions</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/privacy-policy")}
                >
                  <div>
                    <div className="font-medium">Privacy Policy</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Learn how we collect and use your data
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/cookie-policy")}
                >
                  <div>
                    <div className="font-medium">Cookie Policy</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Understand how we use cookies</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/licenses")}
                >
                  <div>
                    <div className="font-medium">Licenses</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Third-party software licenses</div>
                  </div>
                </Button>
              </div>
            </TabsContent>

            {/* Help Settings */}
            <TabsContent value="help" className="space-y-6">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/faq")}
                >
                  <div>
                    <div className="font-medium">Frequently Asked Questions</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Find answers to common questions</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/contact-support")}
                >
                  <div>
                    <div className="font-medium">Contact Support</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Get help from our support team</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/tutorials")}
                >
                  <div>
                    <div className="font-medium">Tutorials</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Learn how to use the app</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => router.push("/feedback")}
                >
                  <div>
                    <div className="font-medium">Send Feedback</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Help us improve our service</div>
                  </div>
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">App Version: 1.2.3</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  © 2023 AccessLink. All rights reserved.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button
              ref={lastFocusableRef}
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
