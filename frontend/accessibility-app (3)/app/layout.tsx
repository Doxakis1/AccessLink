import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AccessibilityProvider } from "@/contexts/accessibility-context"

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
            {children}
            <Toaster />
          </ThemeProvider>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
