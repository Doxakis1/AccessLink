"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useTutorial } from "@/contexts/tutorial-context"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, X, Code, ImageIcon, Play, ExternalLink, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function TutorialOverlay() {
  const router = useRouter()
  const { activeTutorial, currentStep, nextStep, prevStep, endTutorial, goToStep } = useTutorial()
  const [targetElement, setTargetElement] = useState<Element | null>(null)
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, position: "bottom" as const })
  const [mounted, setMounted] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [showImage, setShowImage] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipVisible, setTooltipVisible] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle navigation for tutorial steps that require it
  useEffect(() => {
    if (!activeTutorial) return

    const currentStepData = activeTutorial.steps[currentStep]
    if (currentStepData.action === "navigate" && currentStepData.navigationTarget) {
      router.push(currentStepData.navigationTarget)
    }
  }, [activeTutorial, currentStep, router])

  useEffect(() => {
    if (!activeTutorial) return

    const currentStepData = activeTutorial.steps[currentStep]
    if (!currentStepData.targetSelector) {
      // No target element for this step, center in the screen
      setTargetElement(null)
      return
    }

    // Define the function to find the element
    const findElement = () => {
      const element = document.querySelector(currentStepData.targetSelector!)
      if (element) {
        setTargetElement(element)
        calculatePositions(element)

        // Clear the interval if element is found
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }

    // Try to find the element immediately
    findElement()

    // If not found, keep checking (element might be rendered after a delay)
    intervalRef.current = setInterval(findElement, 500)

    // Clean up interval on unmount or when step changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [activeTutorial, currentStep])

  // Calculate positions for highlight and tooltip
  const calculatePositions = (element: Element) => {
    if (!activeTutorial) return
    const currentStepData = activeTutorial.steps[currentStep]

    const rect = element.getBoundingClientRect()
    const padding = 8 // Padding around the target element

    setOverlayPosition({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding + window.scrollX,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    })

    // Calculate tooltip position
    const position = currentStepData.position || "bottom"
    let tooltipTop = 0
    let tooltipLeft = 0
    const tooltipWidth = 400
    const tooltipHeight = 300 // Approximate height

    switch (position) {
      case "top":
        tooltipTop = rect.top - tooltipHeight - 20 + window.scrollY
        tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX
        break
      case "right":
        tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY
        tooltipLeft = rect.right + 20 + window.scrollX
        break
      case "bottom":
        tooltipTop = rect.bottom + 20 + window.scrollY
        tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX
        break
      case "left":
        tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY
        tooltipLeft = rect.left - tooltipWidth - 20 + window.scrollX
        break
    }

    // Adjust if tooltip would go off screen
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (tooltipLeft < 20) tooltipLeft = 20
    if (tooltipLeft + tooltipWidth > viewportWidth - 20) tooltipLeft = viewportWidth - tooltipWidth - 20
    if (tooltipTop < 20) tooltipTop = 20
    if (tooltipTop + tooltipHeight > viewportHeight - 20) tooltipTop = viewportHeight - tooltipHeight - 20

    setTooltipPosition({
      top: tooltipTop,
      left: tooltipLeft,
      position,
    })
  }

  // Reset media state when step changes
  useEffect(() => {
    setShowCode(false)
    setShowImage(true)
    setShowVideo(false)

    // Briefly hide and show tooltip for animation effect
    setTooltipVisible(false)
    setTimeout(() => setTooltipVisible(true), 300)

    // Scroll to the target element if it exists
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentStep, targetElement])

  // Handle action required to proceed
  useEffect(() => {
    if (!activeTutorial) return

    const currentStepData = activeTutorial.steps[currentStep]
    if (!currentStepData.action || !currentStepData.actionTarget) return

    const targetElement = document.querySelector(currentStepData.actionTarget)
    if (!targetElement) return

    const handleAction = (event: Event) => {
      // Show success feedback
      toast.success("Great job! Moving to next step...")

      // Wait a moment before proceeding to the next step
      setTimeout(() => {
        nextStep()
      }, 1000)
    }

    switch (currentStepData.action) {
      case "click":
        targetElement.addEventListener("click", handleAction)
        break
      case "input":
        targetElement.addEventListener("input", handleAction)
        break
      case "toggle":
        targetElement.addEventListener("change", handleAction)
        break
    }

    return () => {
      switch (currentStepData.action) {
        case "click":
          targetElement.removeEventListener("click", handleAction)
          break
        case "input":
          targetElement.removeEventListener("input", handleAction)
          break
        case "toggle":
          targetElement.removeEventListener("change", handleAction)
          break
      }
    }
  }, [activeTutorial, currentStep, nextStep])

  // Handle exit confirmation
  const handleExitClick = () => {
    setExitConfirmOpen(true)
  }

  const confirmExit = () => {
    // Navigate to home and end tutorial
    router.push("/home")
    endTutorial()
    toast.info("Tutorial exited. You can restart it anytime from the Tutorials button.")
  }

  const cancelExit = () => {
    setExitConfirmOpen(false)
  }

  if (!mounted || !activeTutorial) return null

  const currentStepData = activeTutorial.steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === activeTutorial.steps.length - 1
  const hasCode = !!currentStepData.codeSnippet
  const hasImage = !!currentStepData.image
  const hasVideo = !!currentStepData.video

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      {/* Highlight around target element */}
      {targetElement && (
        <div
          className="absolute border-2 border-blue-500 rounded-md z-50 animate-pulse"
          style={{
            top: overlayPosition.top,
            left: overlayPosition.left,
            width: overlayPosition.width,
            height: overlayPosition.height,
          }}
        />
      )}

      {/* Exit button - always visible in top-right corner */}
      <div className="fixed top-4 right-4 z-[60]">
        <Button variant="destructive" size="sm" onClick={handleExitClick} className="flex items-center gap-1 shadow-lg">
          <X className="h-4 w-4" />
          <span>Exit Tutorial</span>
        </Button>
      </div>

      {/* Exit confirmation dialog */}
      {exitConfirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-bold mb-2">Exit Tutorial?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to exit the tutorial? Your progress will be saved, and you can resume later.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelExit}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmExit} className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Exit to Home</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step counter */}
      <div className="fixed top-4 left-4 z-[60] bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-lg">
        <span className="text-sm font-medium">
          Step {currentStep + 1} of {activeTutorial.steps.length}
        </span>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 w-[400px] z-50 transition-opacity duration-300",
          tooltipVisible ? "opacity-100" : "opacity-0",
          targetElement ? "" : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
        )}
        style={
          targetElement
            ? {
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              }
            : {}
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold">{currentStepData.title}</h3>
            <Button variant="ghost" size="icon" onClick={endTutorial} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">{currentStepData.description}</p>

          {/* Media toggle buttons */}
          {(hasCode || hasImage || hasVideo) && (
            <div className="flex gap-2 mt-2">
              {hasImage && (
                <Button
                  variant={showImage ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowImage(true)
                    setShowCode(false)
                    setShowVideo(false)
                  }}
                  className="flex items-center gap-1"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Image</span>
                </Button>
              )}
              {hasCode && (
                <Button
                  variant={showCode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowCode(true)
                    setShowImage(false)
                    setShowVideo(false)
                  }}
                  className="flex items-center gap-1"
                >
                  <Code className="h-4 w-4" />
                  <span>Code</span>
                </Button>
              )}
              {hasVideo && (
                <Button
                  variant={showVideo ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowVideo(true)
                    setShowImage(false)
                    setShowCode(false)
                  }}
                  className="flex items-center gap-1"
                >
                  <Play className="h-4 w-4" />
                  <span>Video</span>
                </Button>
              )}
            </div>
          )}

          {/* Media content */}
          {showImage && currentStepData.image && (
            <div className="mt-2 rounded-md overflow-hidden">
              <img
                src={currentStepData.image || "/placeholder.svg"}
                alt={`Illustration for ${currentStepData.title}`}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {showCode && currentStepData.codeSnippet && (
            <div className="mt-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto text-xs">
              <pre className="font-mono">{currentStepData.codeSnippet}</pre>
            </div>
          )}

          {showVideo && currentStepData.video && (
            <div className="mt-2 rounded-md overflow-hidden">
              <video
                src={currentStepData.video}
                controls
                className="w-full h-auto"
                aria-label={`Video demonstration for ${currentStepData.title}`}
              />
            </div>
          )}

          {/* Action hint */}
          {currentStepData.action && currentStepData.actionTarget && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <span>
                {currentStepData.action === "click" && "Click the highlighted element to continue"}
                {currentStepData.action === "input" && "Type in the highlighted field to continue"}
                {currentStepData.action === "toggle" && "Toggle the highlighted switch to continue"}
                {currentStepData.action === "navigate" && "Navigating to the next screen..."}
              </span>
            </div>
          )}

          <div className="flex justify-between mt-2">
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="outline" size="sm" onClick={prevStep} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExitClick} className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>Exit</span>
              </Button>
            </div>
            {(!currentStepData.action || !currentStepData.actionTarget) && (
              <Button variant="default" size="sm" onClick={nextStep} className="flex items-center gap-1">
                <span>{isLastStep ? "Finish" : "Next"}</span>
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-1 mt-2">
            {activeTutorial.steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full cursor-pointer transition-colors",
                  index === currentStep ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400",
                )}
                onClick={() => index !== currentStep && goToStep(index)}
                role="button"
                aria-label={`Go to step ${index + 1}`}
                tabIndex={0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
