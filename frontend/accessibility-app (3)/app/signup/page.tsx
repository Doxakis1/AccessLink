import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import SignupForm from "@/components/signup-form"

export const metadata: Metadata = {
  title: "Sign Up - Accessibility Assistant",
  description: "Create an Accessibility Assistant account",
}

export default function SignUpPage() {
  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/login" passHref>
          <Button variant="ghost" size="icon" aria-label="Go back to login">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold ml-2">Sign Up</h1>
      </header>

      <main className="flex-1 p-4 flex items-center justify-center">
        <SignupForm />
      </main>
    </div>
  )
}
