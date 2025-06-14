"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

type NavigationContextType = {
  navigateBack: () => void
  isHomePage: boolean
  isAuthPath: (path: string) => boolean
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Auth paths that should be excluded from normal navigation history
  const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/initial-setup", "/setup"]

  // Check if current path is home
  const isHomePage = pathname === "/home"

  const isAuthPath = (path: string) => {
    return authPaths.some((authPath) => path === authPath || path.startsWith(`${authPath}/`))
  }

  // Override browser back button to always go to home
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default browser back behavior
      event.preventDefault()

      // Don't override navigation on auth paths
      if (!isAuthPath(pathname) && pathname !== "/home") {
        router.push("/home")
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [pathname, router])

  const navigateBack = () => {
    // Always navigate to home unless we're already there or on an auth path
    if (pathname !== "/home" && !isAuthPath(pathname)) {
      router.push("/home")
    } else if (isAuthPath(pathname)) {
      // For auth paths, use browser back or go to login
      if (window.history.length > 1) {
        window.history.back()
      } else {
        router.push("/login")
      }
    }
  }

  return (
    <NavigationContext.Provider value={{ navigateBack, isHomePage, isAuthPath }}>{children}</NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationHistoryProvider")
  }
  return context
}
