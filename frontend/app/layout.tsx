import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AccessibilityProvider } from "@/contexts/accessibility-context"
import { NavigationHistoryProvider } from "@/contexts/navigation-context"
import { TutorialProvider } from "@/contexts/tutorial-context"
import { HardwareBackButtonHandler } from "@/components/hardware-back-button-handler"
import { VoiceNavigationProvider } from "@/contexts/voice-navigation-context"
import { VoiceCommandListener } from "@/components/voice-command-listener"
import { VoiceNavigationOverlay } from "@/components/voice-navigation-overlay"
import { UserProvider } from "@/contexts/user-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Accessibility Assistant",
  description: "Mobile app for accessibility assistance",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccessibilityProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <NavigationHistoryProvider>
              <TutorialProvider>
                <VoiceNavigationProvider>
                  <UserProvider>
                    <HardwareBackButtonHandler />
                    <VoiceCommandListener />
                    <VoiceNavigationOverlay />
                    {children}
                    <Toaster />
                  </UserProvider>
                </VoiceNavigationProvider>
              </TutorialProvider>
            </NavigationHistoryProvider>
          </ThemeProvider>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
