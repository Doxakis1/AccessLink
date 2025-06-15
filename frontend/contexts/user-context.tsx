"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface UserContextType {
  user: {
    email: string
    sessionId: string
    name?: string
    isLoggedIn: boolean
    location?: {
      latitude: string
      longitude: string
    }
    isAvailable: boolean
  }
  login: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
  updateLocation: (latitude: string, longitude: string) => Promise<boolean>
  updateAvailability: (available: boolean) => Promise<boolean>
  sendDistressSignal: () => Promise<boolean>
  removeDistressSignal: () => Promise<boolean>
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({
    email: "",
    sessionId: "",
    name: "",
    isLoggedIn: false,
    location: undefined as { latitude: string; longitude: string } | undefined,
    isAvailable: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Load user data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (error) {
          console.error("Failed to parse saved user data:", error)
          localStorage.removeItem("user")
        }
      }
    }
  }, [])

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && user.isLoggedIn) {
      localStorage.setItem("user", JSON.stringify(user))
    }
  }, [user])

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true)
      try {
        const response = await apiClient.login(email, password)

        if (response.response === "true") {
          setUser({
            email,
            sessionId: response.reason, // The session ID is returned in the reason field
            name: "",
            isLoggedIn: true,
            location: undefined,
            isAvailable: false,
          })

          toast({
            title: "Login successful",
            description: "Welcome back!",
          })

          return true
        } else {
          toast({
            title: "Login failed",
            description: response.reason,
            variant: "destructive",
          })
          return false
        }
      } catch (error) {
        toast({
          title: "Login error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const signUp = useCallback(
    async (email: string, password: string, name?: string): Promise<boolean> => {
      setIsLoading(true)
      try {
        const response = await apiClient.signUp(email, password, name)
        console.log("we are here looool")
        if (response.response === "true") {
          setUser({
            email,
            sessionId: response.reason, // The session ID is returned in the reason field
            name: name || "",
            isLoggedIn: true,
            location: undefined,
            isAvailable: false,
          })

          toast({
            title: "Account created",
            description: "Welcome to AccessLink!",
          })

          return true
        } else {
          toast({
            title: "Sign up failed",
            description: response.reason,
            variant: "destructive",
          })
          return false
        }
      } catch (error) {
        toast({
          title: "Sign up error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const logout = useCallback(() => {
    setUser({
      email: "",
      sessionId: "",
      name: "",
      isLoggedIn: false,
      location: undefined,
      isAvailable: false,
    })

    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }, [toast])

  const updateLocation = useCallback(
    async (latitude: string, longitude: string): Promise<boolean> => {
      if (!user.isLoggedIn) return false

      try {
        const response = await apiClient.updateLocation(user.email, user.sessionId, latitude, longitude)

        if (response.response === "true") {
          setUser((prev) => ({
            ...prev,
            location: { latitude, longitude },
          }))
          return true
        } else {
          toast({
            title: "Location update failed",
            description: response.reason,
            variant: "destructive",
          })
          return false
        }
      } catch (error) {
        toast({
          title: "Location error",
          description: "Failed to update location",
          variant: "destructive",
        })
        return false
      }
    },
    [user.email, user.sessionId, user.isLoggedIn, toast],
  )

  const updateAvailability = useCallback(
    async (available: boolean): Promise<boolean> => {
      if (!user.isLoggedIn) return false

      try {
          toast({
            title: available ? "Now available" : "Now unavailable",
            description: available ? "You can now receive help requests" : "You will not receive help requests",
          })

          return true
        } catch (error) {
        toast({
          title: "Availability error",
          description: "Failed to update availability",
          variant: "destructive",
        })
        return false
      }
    },
    [user.email, user.sessionId, user.isLoggedIn, toast],
  )

  const sendDistressSignal = useCallback(async (): Promise<boolean> => {
    if (!user.isLoggedIn || !user.location) {
      toast({
        title: "Cannot send signal",
        description: "Please ensure you're logged in and location is available",
        variant: "destructive",
      })
      return false
    }

    try {
      const response = await apiClient.sendDistressSignal(
        user.email,
        user.sessionId,
        user.location.latitude,
        user.location.longitude,
        user.name || user.email,
      )

      if (response.response === "true") {
        toast({
          title: "Distress signal sent",
          description: "Help is on the way!",
        })
        return true
      } else {
        toast({
          title: "Signal failed",
          description: response.reason,
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Signal error",
        description: "Failed to send distress signal",
        variant: "destructive",
      })
      return false
    }
  }, [user.email, user.sessionId, user.isLoggedIn, user.location, user.name, toast])

  const removeDistressSignal = useCallback(async (): Promise<boolean> => {
    if (!user.isLoggedIn) return false

    try {
      const response = await apiClient.removeDistressSignal(user.email, user.sessionId)

      if (response.response === "true") {
        toast({
          title: "Signal removed",
          description: "Your distress signal has been cancelled",
        })
        return true
      } else {
        toast({
          title: "Remove signal failed",
          description: response.reason,
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Remove signal error",
        description: "Failed to remove distress signal",
        variant: "destructive",
      })
      return false
    }
  }, [user.email, user.sessionId, user.isLoggedIn, toast])

  const value = {
    user,
    login,
    signUp,
    logout,
    updateLocation,
    updateAvailability,
    sendDistressSignal,
    removeDistressSignal,
    isLoading,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
