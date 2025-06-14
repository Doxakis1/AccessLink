"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define tutorial types
export type TutorialId =
  | "navigation"
  | "accessibility-settings"
  | "emergency-contacts"
  | "ai-assistant"
  | "reports"
  | "voice-commands"
  | "accessibility-assessment"
  | "visual-customization"
  | "screen-reader"
  | "keyboard-shortcuts"

export type DifficultyLevel = "beginner" | "intermediate" | "advanced"
export type TutorialCategory = "navigation" | "accessibility" | "communication" | "customization" | "safety"

interface TutorialStep {
  title: string
  description: string
  targetSelector?: string // CSS selector for the element to highlight
  position?: "top" | "right" | "bottom" | "left" // Position of the tooltip
  action?: "click" | "input" | "toggle" | "observe" | "navigate" // Action required to proceed
  actionTarget?: string // Selector for the element to interact with
  navigationTarget?: string // Route to navigate to
  codeSnippet?: string // Optional code snippet to display
  image?: string // Optional image URL to display
  video?: string // Optional video URL to display
}

export interface Tutorial {
  id: TutorialId
  title: string
  description: string
  category: TutorialCategory
  difficulty: DifficultyLevel
  duration: number // Estimated time in minutes
  steps: TutorialStep[]
  prerequisites?: TutorialId[] // Tutorials that should be completed first
  tags: string[] // For searching and filtering
}

interface TutorialProgress {
  id: TutorialId
  completed: boolean
  lastStep: number
  lastAccessed: string // ISO date string
}

interface TutorialContextType {
  activeTutorial: Tutorial | null
  currentStep: number
  tutorialProgress: TutorialProgress[]
  availableTutorials: Tutorial[]
  startTutorial: (tutorialId: TutorialId) => void
  endTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  markTutorialComplete: (tutorialId: TutorialId) => void
  isTutorialComplete: (tutorialId: TutorialId) => boolean
  getTutorialProgress: (tutorialId: TutorialId) => number
  dismissAllTutorials: () => void
  resetAllTutorials: () => void
  filterTutorials: (options: {
    category?: TutorialCategory
    difficulty?: DifficultyLevel
    searchTerm?: string
    completed?: boolean
  }) => Tutorial[]
  getRecommendedTutorials: () => Tutorial[]
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

// Define available tutorials
const tutorials: Tutorial[] = [
  {
    id: "navigation",
    title: "App Navigation",
    description: "Learn how to navigate around the AccessLink app",
    category: "navigation",
    difficulty: "beginner",
    duration: 5,
    tags: ["navigation", "basics", "getting started", "routes", "transitions"],
    steps: [
      {
        title: "Welcome to Navigation Tutorial",
        description: "This tutorial will guide you through navigating the AccessLink app efficiently and effectively.",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Home Screen Layout",
        description:
          "The home screen is your central hub. It provides quick access to all main features through large, accessible action buttons.",
        targetSelector: "[role='menu']",
        position: "bottom",
        image: "/placeholder.svg?height=200&width=400",
        codeSnippet: `// Home screen navigation structure
<nav aria-labelledby="page-description">
  <div className="grid gap-6 grid-cols-2 max-w-3xl mx-auto" role="menu">
    <ActionButton label="Call for Help" shortcutKey="1" />
    <ActionButton label="AI Assistant" shortcutKey="2" />
    <ActionButton label="Gadgets" shortcutKey="3" />
    <ActionButton label="Reports" shortcutKey="4" />
  </div>
</nav>`,
      },
      {
        title: "Action Buttons",
        description:
          "Each action button takes you to a different section of the app. Tap any button to navigate to that feature.",
        targetSelector: "[aria-label='AI Assistant: Chat with your virtual assistant']",
        position: "bottom",
        action: "click",
        actionTarget: "[aria-label='AI Assistant: Chat with your virtual assistant']",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "AI Assistant Page",
        description:
          "You've navigated to the AI Assistant page. Notice how the page transitions smoothly from the home screen.",
        position: "top",
        image: "/placeholder.svg?height=200&width=400",
        codeSnippet: `// Route transition example
const handleAction = (action: string) => {
  // For navigation actions, use the router
  switch (action) {
    case "AI Assistant":
      router.push("/ai-assistant")
      break;
    case "Reports":
      router.push("/reports")
      break;
    // Other routes...
  }
}`,
      },
      {
        title: "Back Navigation",
        description: "To return to the previous screen, use the back button in the top-left corner of any page.",
        targetSelector: "button[aria-label='Go back to home']",
        position: "right",
        action: "click",
        actionTarget: "button[aria-label='Go back to home']",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Quick Settings",
        description:
          "The settings button in the top-left corner of the home screen gives you quick access to your profile and app settings.",
        targetSelector: "[aria-label='User Settings']",
        position: "right",
        action: "click",
        actionTarget: "[aria-label='User Settings']",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Quick Settings Menu",
        description: "The Quick Settings menu provides access to frequently used settings and profile options.",
        position: "right",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Closing Dialogs",
        description:
          "To close any dialog or menu, tap outside the dialog or use the close button (X) in the top-right corner.",
        position: "top",
        action: "click",
        actionTarget: "[aria-label='Close']",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Accessibility Settings",
        description:
          "The accessibility button in the top-right corner of the home screen gives you quick access to accessibility settings.",
        targetSelector: "[aria-label='Accessibility Settings']",
        position: "left",
        action: "click",
        actionTarget: "[aria-label='Accessibility Settings']",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Keyboard Navigation",
        description:
          "You can navigate the app using keyboard shortcuts. Numbers 1-4 correspond to the main action buttons on the home screen.",
        position: "bottom",
        image: "/placeholder.svg?height=200&width=400",
        codeSnippet: `// Keyboard shortcut implementation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === shortcutKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      onClick()
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}, [shortcutKey, onClick])`,
      },
      {
        title: "Help Toggle",
        description:
          "The help toggle on the home screen lets you make yourself available to help others or receive help.",
        targetSelector: "#availability-toggle",
        position: "bottom",
        action: "toggle",
        actionTarget: "#availability-toggle",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Tutorial Access",
        description:
          "You can access tutorials anytime by tapping the 'Tutorials' button at the bottom of the home screen.",
        targetSelector: "button[aria-label='Open tutorials']",
        position: "top",
        image: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Navigation Complete",
        description:
          "Great job! You now know how to navigate the app efficiently. Remember, you can access this tutorial again anytime from the Tutorials button.",
        image: "/placeholder.svg?height=200&width=400",
      },
    ],
  },
  // Other tutorials remain the same...
]

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [tutorialProgress, setTutorialProgress] = useState<TutorialProgress[]>([])
  const [mounted, setMounted] = useState(false)

  // Load tutorial progress from localStorage
  useEffect(() => {
    setMounted(true)
    const savedTutorialProgress = localStorage.getItem("tutorialProgress")
    if (savedTutorialProgress) {
      try {
        setTutorialProgress(JSON.parse(savedTutorialProgress))
      } catch (e) {
        console.error("Failed to parse tutorial progress", e)
      }
    }
  }, [])

  // Save tutorial progress to localStorage
  const saveTutorialProgress = (progress: TutorialProgress[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tutorialProgress", JSON.stringify(progress))
    }
  }

  // Start a tutorial
  const startTutorial = (tutorialId: TutorialId) => {
    const tutorial = tutorials.find((t) => t.id === tutorialId)
    if (tutorial) {
      setActiveTutorial(tutorial)

      // Check if we have progress for this tutorial
      const progress = tutorialProgress.find((p) => p.id === tutorialId)
      if (progress && !progress.completed) {
        setCurrentStep(progress.lastStep)
      } else {
        setCurrentStep(0)
      }

      // Update last accessed time
      updateTutorialProgress(tutorialId, {
        lastAccessed: new Date().toISOString(),
      })
    }
  }

  // End the current tutorial
  const endTutorial = () => {
    if (activeTutorial) {
      // Save progress before ending
      updateTutorialProgress(activeTutorial.id, {
        lastStep: currentStep,
      })
    }
    setActiveTutorial(null)
    setCurrentStep(0)
  }

  // Go to the next step
  const nextStep = () => {
    if (activeTutorial && currentStep < activeTutorial.steps.length - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)

      // Update progress
      updateTutorialProgress(activeTutorial.id, {
        lastStep: newStep,
      })
    } else if (activeTutorial) {
      // Mark tutorial as complete when reaching the end
      markTutorialComplete(activeTutorial.id)
      endTutorial()
    }
  }

  // Go to the previous step
  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)

      // Update progress
      if (activeTutorial) {
        updateTutorialProgress(activeTutorial.id, {
          lastStep: newStep,
        })
      }
    }
  }

  // Go to a specific step
  const goToStep = (step: number) => {
    if (activeTutorial && step >= 0 && step < activeTutorial.steps.length) {
      setCurrentStep(step)

      // Update progress
      updateTutorialProgress(activeTutorial.id, {
        lastStep: step,
      })
    }
  }

  // Update tutorial progress
  const updateTutorialProgress = (tutorialId: TutorialId, updates: Partial<TutorialProgress>) => {
    const updatedProgress = [...tutorialProgress]
    const index = updatedProgress.findIndex((p) => p.id === tutorialId)

    if (index >= 0) {
      // Update existing progress
      updatedProgress[index] = {
        ...updatedProgress[index],
        ...updates,
      }
    } else {
      // Create new progress entry
      updatedProgress.push({
        id: tutorialId,
        completed: false,
        lastStep: 0,
        lastAccessed: new Date().toISOString(),
        ...updates,
      })
    }

    setTutorialProgress(updatedProgress)
    saveTutorialProgress(updatedProgress)
  }

  // Mark a tutorial as complete
  const markTutorialComplete = (tutorialId: TutorialId) => {
    updateTutorialProgress(tutorialId, {
      completed: true,
      lastStep: tutorials.find((t) => t.id === tutorialId)?.steps.length ?? 0,
    })
  }

  // Check if a tutorial is complete
  const isTutorialComplete = (tutorialId: TutorialId) => {
    return tutorialProgress.some((p) => p.id === tutorialId && p.completed)
  }

  // Get tutorial progress percentage
  const getTutorialProgress = (tutorialId: TutorialId) => {
    const progress = tutorialProgress.find((p) => p.id === tutorialId)
    const tutorial = tutorials.find((t) => t.id === tutorialId)

    if (!progress || !tutorial) return 0

    if (progress.completed) return 100

    return Math.round((progress.lastStep / (tutorial.steps.length - 1)) * 100)
  }

  // Dismiss all tutorials
  const dismissAllTutorials = () => {
    const allTutorialIds = tutorials.map((t) => t.id)
    const updatedProgress = allTutorialIds.map((id) => ({
      id,
      completed: true,
      lastStep: tutorials.find((t) => t.id === id)?.steps.length ?? 0,
      lastAccessed: new Date().toISOString(),
    }))

    setTutorialProgress(updatedProgress)
    saveTutorialProgress(updatedProgress)
    endTutorial()
  }

  // Reset all tutorials
  const resetAllTutorials = () => {
    setTutorialProgress([])
    saveTutorialProgress([])
    endTutorial()
  }

  // Filter tutorials based on criteria
  const filterTutorials = (options: {
    category?: TutorialCategory
    difficulty?: DifficultyLevel
    searchTerm?: string
    completed?: boolean
  }) => {
    return tutorials.filter((tutorial) => {
      // Filter by category
      if (options.category && tutorial.category !== options.category) {
        return false
      }

      // Filter by difficulty
      if (options.difficulty && tutorial.difficulty !== options.difficulty) {
        return false
      }

      // Filter by completion status
      if (options.completed !== undefined) {
        const isCompleted = isTutorialComplete(tutorial.id)
        if (options.completed !== isCompleted) {
          return false
        }
      }

      // Filter by search term
      if (options.searchTerm) {
        const searchTerm = options.searchTerm.toLowerCase()
        const matchesTitle = tutorial.title.toLowerCase().includes(searchTerm)
        const matchesDescription = tutorial.description.toLowerCase().includes(searchTerm)
        const matchesTags = tutorial.tags.some((tag) => tag.toLowerCase().includes(searchTerm))

        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false
        }
      }

      return true
    })
  }

  // Get recommended tutorials based on user progress
  const getRecommendedTutorials = () => {
    // Start with beginner tutorials that aren't completed
    const beginnerTutorials = tutorials.filter((t) => t.difficulty === "beginner" && !isTutorialComplete(t.id))

    if (beginnerTutorials.length > 0) {
      return beginnerTutorials
    }

    // Then recommend intermediate tutorials where prerequisites are completed
    const intermediateTutorials = tutorials.filter((t) => {
      if (t.difficulty !== "intermediate" || isTutorialComplete(t.id)) {
        return false
      }

      // Check if all prerequisites are completed
      if (t.prerequisites) {
        return t.prerequisites.every((prereq) => isTutorialComplete(prereq))
      }

      return true
    })

    if (intermediateTutorials.length > 0) {
      return intermediateTutorials
    }

    // Finally recommend advanced tutorials where prerequisites are completed
    return tutorials.filter((t) => {
      if (t.difficulty !== "advanced" || isTutorialComplete(t.id)) {
        return false
      }

      // Check if all prerequisites are completed
      if (t.prerequisites) {
        return t.prerequisites.every((prereq) => isTutorialComplete(prereq))
      }

      return true
    })
  }

  return (
    <TutorialContext.Provider
      value={{
        activeTutorial,
        currentStep,
        tutorialProgress,
        availableTutorials: tutorials,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        goToStep,
        markTutorialComplete,
        isTutorialComplete,
        getTutorialProgress,
        dismissAllTutorials,
        resetAllTutorials,
        filterTutorials,
        getRecommendedTutorials,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return context
}
