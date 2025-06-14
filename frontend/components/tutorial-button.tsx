"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TutorialHub } from "@/components/tutorial-hub"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import { useTutorial } from "@/contexts/tutorial-context"
import { BookOpen } from "lucide-react"

export function TutorialButton() {
  const [open, setOpen] = useState(false)
  const { tutorialProgress, availableTutorials } = useTutorial()

  // Calculate completion percentage
  const completedCount = tutorialProgress.filter((p) => p.completed).length
  const totalCount = availableTutorials.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100) || 0

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        aria-label="Open tutorials"
        className="relative flex items-center gap-2 px-6 py-2 min-h-[48px] border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      >
        <BookOpen className="w-5 h-5" />
        <span className="font-medium">Tutorials</span>

        {/* Progress indicator */}
        <div className="ml-2 flex items-center gap-1">
          <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${completionPercentage}%` }} />
          </div>
          <span className="text-xs font-medium">{completionPercentage}%</span>
        </div>

        {/* New badge for incomplete tutorials */}
        {completedCount < totalCount && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalCount - completedCount}
          </span>
        )}
      </Button>
      <TutorialHub open={open} onOpenChange={setOpen} />
      <TutorialOverlay />
    </>
  )
}
