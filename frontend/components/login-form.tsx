"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { StatusAnnouncer } from "@/components/status-announcer"
import { SkipLink } from "@/components/skip-link"
import Link from "next/link"
import { GoogleLoginButton } from "@/components/google-login-button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { apiClient } from "@/lib/api-client"

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

interface UserProfile {
  displayName: string
  avatar: string | null
  language: string
  location: string
  accessibilityNeeds: string
  bio: string
}

export default function LoginForm() {
  // State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Refs
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { toast } = useToast()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Try to load profile data
    try {
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }
    } catch (e) {
      console.error("Failed to load profile data", e)
    }
  }, [])

  // Focus first input on mount
  useEffect(() => {
    if (mounted) {
      emailInputRef.current?.focus()
    }
  }, [mounted])

  // Focus on first error when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      if (errors.email) {
        emailInputRef.current?.focus()
      } else if (errors.password) {
        passwordInputRef.current?.focus()
      } else if (errors.general) {
        errorRef.current?.focus()
      }
    }
  }, [errors])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setStatusMessage("Form validation failed. Please correct the errors.")
      setTimeout(() => setStatusMessage(null), 3000)
      return
    }

    setIsLoading(true)
    setStatusMessage("Logging in, please wait...")

    try {
      // Simulate API call
      const login_response = await apiClient.login(email, password)
      if (login_response.response === "false"){
        throw new Error("Invalid email or password")
      }

      // In a real app, you would validate the password here
      // For demo purposes, we'll just accept any password
      const saveProfile = () => {
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            displayName: email,
            sessionID: login_response.reason,
            avatar: null,
            language: "en",
            location: "Athens",
            accessibilityNeeds: "",
            bio: "",
          }),
        )
      }
      saveProfile()
      toast({
        title: "Login successful",
        description: `Welcome back, ${email}!`,
      })

      setStatusMessage("Login successful. Redirecting to home page.")

      // Redirect to home page after successful login
      setTimeout(() => {
        router.push("/home")
      }, 1000)
    } catch (error) {
      console.error("Login error:", error)

      setErrors({
        general: error instanceof Error ? error.message : "Login failed. Please check your credentials and try again.",
      })

      setStatusMessage("Login failed. Please check your credentials and try again.")
      setTimeout(() => setStatusMessage(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (!mounted) return null

  return (
    <>
      <SkipLink />
      <StatusAnnouncer message={statusMessage} />

      <main
        id="main-content"
        className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4"
        tabIndex={-1}
      >
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader>
              {profile && profile.displayName && (
                <div className="flex flex-col items-center mb-4">
                  {/* <Avatar className="w-16 h-16 mb-2">
                    {profile.avatar ? (
                      <AvatarImage
                        src={profile.avatar || "/placeholder.svg"}
                        alt={`${profile.displayName}'s profile picture`}
                      />
                    ) : (
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xl">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar> */}
                  {/* <p className="text-sm text-slate-600 dark:text-slate-400">Welcome back, {profile.displayName}</p> */}
                </div>
              )}
              <CardTitle className="text-2xl text-center">Login</CardTitle>
              <CardDescription className="text-center">Sign in to your Accessibility Assistant account</CardDescription>
            </CardHeader>

            {errors.general && (
              <div
                ref={errorRef}
                className="mx-6 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
              >
                <p className="font-medium">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <Label htmlFor="email" className="text-base">
                      Email
                    </Label>
                    {errors.email && (
                      <span className="text-sm text-red-600 dark:text-red-400" id="email-error">
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <Input
                    id="email"
                    ref={emailInputRef}
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <Label htmlFor="password" className="text-base">
                      Password
                    </Label>
                    {errors.password && (
                      <span className="text-sm text-red-600 dark:text-red-400" id="password-error">
                        {errors.password}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className={`pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      disabled={isLoading}
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  ref={submitButtonRef}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Logging in...
                    </>
                  ) : (
                    "Log in"
                  )}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300 dark:border-slate-600"></span>
                  </div>
                  {/* <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Or</span>
                  </div> */}
                </div>

                {/* <GoogleLoginButton mode="login" /> */}

                <p className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </>
  )
}
