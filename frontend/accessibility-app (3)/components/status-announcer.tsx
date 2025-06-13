"use client"

interface StatusAnnouncerProps {
  message: string | null
}

export function StatusAnnouncer({ message }: StatusAnnouncerProps) {
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  )
}
