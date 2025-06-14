"use client"

import type React from "react"

import { BackButton } from "@/components/back-button"
import { SkipLink } from "@/components/skip-link"
import { StatusAnnouncer } from "@/components/status-announcer"
import { useState } from "react"

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function PageLayout({ children, title, description }: PageLayoutProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  return (
    <>
      <SkipLink />
      <StatusAnnouncer message={statusMessage} />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 py-8 mx-auto">
          <header className="mb-6 flex items-center">
            <BackButton className="mr-2" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
              {description && <p className="text-slate-700 dark:text-slate-300 mt-1">{description}</p>}
            </div>
          </header>

          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
