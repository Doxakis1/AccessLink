"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { StatusAnnouncer } from "@/components/status-announcer"
import { SkipLink } from "@/components/skip-link"
import Link from "next/link"

interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

export default function ResetPasswordForm() {
  // State
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(true)
  const [isTokenChecked, setIsTokenChecked] = useState(false)

  // Refs
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get token from URL
  const token = searchParams.get("token")

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Validate token on mount
  useEffect(() => {
    if (mounted) {
      // In a real app, you would validate the token with your backend
      // For demo purposes, we'll just check if it exists
      const validateToken = async () => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // For demo purposes, we'll consider the token valid if it's "demo-token"
          // or if it's at least 10 characters long
          const isValid = token === "demo-token" || (token !== null && token.length >= 10)
          setIsTokenValid(isValid)
          setIsTokenChecked(true)

          if (!isValid) {
            setStatusMessage("Invalid or expired reset link. Please request a new one.")
          } else {
            // Focus password input if token is valid
            passwordInputRef.current?.focus()
          }
        } catch (error) {
          console.error("Token validation error:", error)
          setIsTokenValid(false)
          setIsTokenChecked(true)
          setStatusMessage("Failed to validate reset link. Please request a new one.")
        }
      }

      validateToken()
    }
  }, [mounted, token])

  // Focus on error when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      if (errors.password) {
        passwordInputRef.current?.focus()
      } else if (errors.confirmPassword) {
        confirmPasswordInputRef.current?.focus()
      } else if (errors.general) {
        errorRef.current?.focus()
      }
    }
  }, [errors])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Password validation
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter"
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter"
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number"
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
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
    setStatusMessage("Resetting your password, please wait...")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, you would send the new password and token to your backend
      // For demo purposes, we'll just pretend it worked

      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      })

      setStatusMessage("Password reset successful. You can now log in with your new password.")
      setIsSubmitted(true)

      // Redirect to login page after a delay
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      console.error("Password reset error:", error)

      setErrors({
        general: error instanceof Error ? error.message : "Failed to reset password. Please try again.",
      })

      setStatusMessage("Failed to reset password. Please try again.")
      setTimeout(() => setStatusMessage(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
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
              <div className="flex items-center mb-2">
                <Link href="/login" passHref>
                  <Button variant="ghost" size="icon" aria-label="Back to login" className="mr-2">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
              </div>
              <CardDescription>
                {isSubmitted
                  ? "Your password has been reset successfully"
                  : isTokenValid
                    ? "Create a new password for your account"
                    : "Invalid or expired reset link"}
              </CardDescription>
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

            {!isTokenChecked ? (
              <CardContent className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Validating reset link..." />
              </CardContent>
            ) : !isTokenValid ? (
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="text-center text-slate-600 dark:text-slate-300">
                    This password reset link is invalid or has expired.
                  </p>
                  <Button
                    onClick={() => router.push("/forgot-password")}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Request New Reset Link
                  </Button>
                </div>
              </CardContent>
            ) : !isSubmitted ? (
              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-4">
                  {/* Password field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <Label htmlFor="password" className="text-base">
                        New Password
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
                        autoComplete="new-password"
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Password must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <Label htmlFor="confirmPassword" className="text-base">
                        Confirm Password
                      </Label>
                      {errors.confirmPassword && (
                        <span className="text-sm text-red-600 dark:text-red-400" id="confirm-password-error">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        ref={confirmPasswordInputRef}
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                        aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                        className={`pr-10 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        disabled={isLoading}
                        required
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={toggleConfirmPasswordVisibility}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        aria-pressed={showConfirmPassword}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
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
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-medium text-center">Password Reset Successful</h3>
                  <p className="text-center mt-2 text-slate-600 dark:text-slate-300">
                    Your password has been reset successfully. You will be redirected to the login page shortly.
                  </p>
                </div>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Go to Login
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
