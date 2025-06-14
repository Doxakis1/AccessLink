import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility Test Page - Accessibility Assistant",
  description: "Test and verify accessibility features",
}

export default function TestAccessibilityPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Accessibility Test Page</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Your Settings</CardTitle>
            <CardDescription>
              This page helps you verify that your accessibility settings are working correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Your current font size, color scheme, and other visual preferences should be applied to this page.</p>

            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>

            <div className="mt-6">
              <Link href="/settings" className="text-blue-600 dark:text-blue-400 underline">
                Return to Settings
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 underline">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
