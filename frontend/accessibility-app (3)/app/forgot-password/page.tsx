import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Forgot Password - Accessibility Assistant",
  description: "Reset your Accessibility Assistant password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/login" passHref>
          <Button variant="ghost" size="icon" aria-label="Go back to login">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold ml-2">Forgot Password</h1>
      </header>

      <main className="flex-1 p-4 flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          <p className="text-center text-slate-600 dark:text-slate-400">This feature will be implemented soon.</p>
        </div>
      </main>
    </div>
  )
}
