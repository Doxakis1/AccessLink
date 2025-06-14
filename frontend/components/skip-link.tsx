"use client"

import { useState } from "react"

export function SkipLink() {
  const [focused, setFocused] = useState(false)

  return (
    <a
      href="#main-content"
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
        focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-offset-white focus:ring-black
        dark:focus:bg-slate-900 dark:focus:text-white dark:focus:ring-offset-slate-900 dark:focus:ring-white
      `}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      Skip to main content
    </a>
  )
}
