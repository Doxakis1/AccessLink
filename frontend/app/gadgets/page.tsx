import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function GadgetsPage() {
  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="flex items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" aria-label="Go back to home">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold ml-2">Gadgets</h1>
      </header>

      <main className="flex-1 p-4">
        <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
          Gadgets management functionality will be implemented here.
        </p>
      </main>
    </div>
  )
}
