"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Mail, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { StatusAnnouncer } from "@/components/status-announcer"
import { SkipLink } from "@/components/skip-link"
import Link from "next/link"

interface FormErrors {
  email?: string
  general?: string
}

export default function ForgotPasswordForm() {
  // State
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Refs
  const emailInputRef = useRef<HTMLInputElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { toast } = useToast()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus first input on mount
  useEffect(() => {
    if (mounted) {
      emailInputRef.current?.focus()
    }
  }, [mounted])

  // Focus on error when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      if (errors.email) {
        emailInputRef.current?.focus()
      } else if (errors.general) {
        errorRef.current?.focus()
      }
    }
  }, [errors])

  // Handle resend countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [resendCountdown, resendDisabled])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
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
    setStatusMessage("Sending password reset instructions, please wait...")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if email exists in localStorage (for demo purposes)
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userExists = users.some((u: any) => u.email === email)

      // For demo purposes, we'll pretend the email was sent regardless
      // In a real app, you might want to only send if the user exists

      toast({
        title: "Reset instructions sent",
        description: "Check your email for instructions to reset your password.",
      })

      setStatusMessage("Password reset instructions sent. Please check your email.")
      setIsSubmitted(true)
      setResendDisabled(true)
      setResendCountdown(60) // 60 second cooldown for resend
    } catch (error) {
      console.error("Password reset error:", error)

      setErrors({
        general: error instanceof Error ? error.message : "Failed to send reset instructions. Please try again.",
      })

      setStatusMessage("Failed to send reset instructions. Please try again.")
      setTimeout(() => setStatusMessage(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend
  const handleResend = async () => {
    if (resendDisabled) return

    setIsLoading(true)
    setStatusMessage("Resending password reset instructions, please wait...")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Reset instructions resent",
        description: "Check your email for instructions to reset your password.",
      })

      setStatusMessage("Password reset instructions resent. Please check your email.")
      setResendDisabled(true)
      setResendCountdown(60) // 60 second cooldown for resend
    } catch (error) {
      console.error("Password reset error:", error)

      toast({
        title: "Error",
        description: "Failed to resend reset instructions. Please try again.",
        variant: "destructive",
      })

      setStatusMessage("Failed to resend reset instructions. Please try again.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatusMessage(null), 3000)
    }
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
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
              </div>
              <CardDescription>
                {isSubmitted
                  ? "Check your email for password reset instructions"
                  : "Enter your email to receive password reset instructions"}
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

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <Label htmlFor="email" className="text-base">
                        Email Address
                      </Label>
                      {errors.email && (
                        <span className="text-sm text-red-600 dark:text-red-400" id="email-error">
                          {errors.email}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <Input
                        id="email"
                        ref={emailInputRef}
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={`pl-10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        disabled={isLoading}
                        required
                        autoComplete="email"
                      />
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
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Instructions
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Return to login
                    </Link>
                  </div>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-medium text-center">Check Your Email</h3>
                  <p className="text-center mt-2 text-slate-600 dark:text-slate-300">
                    We've sent password reset instructions to:
                  </p>
                  <p className="font-medium text-center mt-1">{email}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    If you don't see the email, check your spam folder or request another email.
                  </p>

                  <Button
                    onClick={handleResend}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading || resendDisabled}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending...
                      </>
                    ) : resendDisabled ? (
                      `Resend Email (${resendCountdown}s)`
                    ) : (
                      "Resend Email"
                    )}
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Return to login
                    </Link>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </>
  )
}
