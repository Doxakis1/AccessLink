"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useAccessibility } from "@/contexts/accessibility-context"
import { useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const accessibilityContext = useAccessibility()
  let settings = { theme: "system" }

  // Try to use the accessibility context, but don't fail if it's not available
  if (accessibilityContext) {
    settings = accessibilityContext.settings
  } else {
    console.warn("AccessibilityProvider not found, using default theme settings")
  }

  // Sync theme with accessibility settings
  useEffect(() => {
    if (props.forcedTheme) return

    // Set theme based on accessibility settings
    if (settings.theme === "system" || settings.theme === "light" || settings.theme === "dark") {
      document.documentElement.setAttribute("data-theme", settings.theme)
    } else if (settings.theme === "high-contrast") {
      document.documentElement.setAttribute("data-theme", "dark")
      document.documentElement.classList.add("high-contrast")
    }
  }, [settings.theme, props.forcedTheme])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
