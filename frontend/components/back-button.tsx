"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigation } from "@/contexts/navigation-context"

interface BackButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  label?: string
}

export function BackButton({
  className = "",
  variant = "ghost",
  size = "icon",
  label = "Back to home",
}: BackButtonProps) {
  const { navigateBack, isHomePage } = useNavigation()

  // Don't render the button if we're already on the home page
  if (isHomePage) return null

  return (
    <Button variant={variant} size={size} className={`${className}`} onClick={navigateBack} aria-label={label}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {size !== "icon" && <span>{label}</span>}
    </Button>
  )
}
