"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useMobile(breakpoint = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [breakpoint])

  return isMobile
}
