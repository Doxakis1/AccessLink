"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTutorial, type TutorialId, type TutorialCategory, type DifficultyLevel } from "@/contexts/tutorial-context"
import { CheckCircle, RotateCcw, Search, Filter, Clock, X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TutorialHubProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TutorialHub({ open, onOpenChange }: TutorialHubProps) {
  const {
    startTutorial,
    isTutorialComplete,
    getTutorialProgress,
    tutorialProgress,
    availableTutorials,
    filterTutorials,
    getRecommendedTutorials,
    resetAllTutorials,
  } = useTutorial()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory | "all">("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all")
  const [activeTab, setActiveTab] = useState("all")

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (tutorialProgress.filter((p) => p.completed).length / availableTutorials.length) * 100,
  )

  // Filter tutorials based on current filters
  const getFilteredTutorials = () => {
    let filtered = availableTutorials

    if (activeTab === "recommended") {
      return getRecommendedTutorials()
    } else if (activeTab === "inProgress") {
      filtered = filtered.filter((tutorial) => {
        const progress = tutorialProgress.find((p) => p.id === tutorial.id)
        return progress && progress.lastStep > 0 && !progress.completed
      })
    } else if (activeTab === "completed") {
      filtered = filtered.filter((tutorial) => isTutorialComplete(tutorial.id))
    }

    return filterTutorials({
      category: selectedCategory !== "all" ? (selectedCategory as TutorialCategory) : undefined,
      difficulty: selectedDifficulty !== "all" ? (selectedDifficulty as DifficultyLevel) : undefined,
      searchTerm: searchTerm,
    })
  }

  const filteredTutorials = getFilteredTutorials()

  // Group tutorials by category
  const tutorialsByCategory = filteredTutorials.reduce(
    (acc, tutorial) => {
      if (!acc[tutorial.category]) {
        acc[tutorial.category] = []
      }
      acc[tutorial.category].push(tutorial)
      return acc
    },
    {} as Record<TutorialCategory, typeof filteredTutorials>,
  )

  const categoryLabels: Record<TutorialCategory, string> = {
    navigation: "Navigation",
    accessibility: "Accessibility",
    communication: "Communication",
    customization: "Customization",
    safety: "Safety",
  }

  const difficultyLabels: Record<DifficultyLevel, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Interactive Tutorials</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {tutorialProgress.filter((p) => p.completed).length} of {availableTutorials.length} tutorials completed
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${completionPercentage}%` }}
                role="progressbar"
                aria-valuenow={completionPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search tutorials..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500">Filters:</span>
            </div>

            {/* Category filter */}
            <select
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TutorialCategory | "all")}
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Difficulty filter */}
            <select
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-sm"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | "all")}
            >
              <option value="all">All Difficulties</option>
              {Object.entries(difficultyLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Clear filters button */}
            {(searchTerm || selectedCategory !== "all" || selectedDifficulty !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedDifficulty("all")
                }}
                className="h-7 px-2 text-sm"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {filteredTutorials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No tutorials match your search criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(tutorialsByCategory).map(([category, tutorials]) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium mb-3">{categoryLabels[category as TutorialCategory]}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {tutorials.map((tutorial) => (
                        <TutorialCard
                          key={tutorial.id}
                          id={tutorial.id}
                          title={tutorial.title}
                          description={tutorial.description}
                          difficulty={tutorial.difficulty}
                          duration={tutorial.duration}
                          completed={isTutorialComplete(tutorial.id)}
                          progress={getTutorialProgress(tutorial.id)}
                          onStart={() => {
                            startTutorial(tutorial.id)
                            onOpenChange(false)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommended" className="mt-0">
            {filteredTutorials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No recommended tutorials available.</p>
                <p className="text-slate-500 text-sm mt-2">
                  You've completed all tutorials or no tutorials match your current level.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTutorials.map((tutorial) => (
                  <TutorialCard
                    key={tutorial.id}
                    id={tutorial.id}
                    title={tutorial.title}
                    description={tutorial.description}
                    difficulty={tutorial.difficulty}
                    duration={tutorial.duration}
                    completed={isTutorialComplete(tutorial.id)}
                    progress={getTutorialProgress(tutorial.id)}
                    onStart={() => {
                      startTutorial(tutorial.id)
                      onOpenChange(false)
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inProgress" className="mt-0">
            {filteredTutorials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No tutorials in progress.</p>
                <p className="text-slate-500 text-sm mt-2">Start a tutorial to see it here.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTutorials.map((tutorial) => (
                  <TutorialCard
                    key={tutorial.id}
                    id={tutorial.id}
                    title={tutorial.title}
                    description={tutorial.description}
                    difficulty={tutorial.difficulty}
                    duration={tutorial.duration}
                    completed={isTutorialComplete(tutorial.id)}
                    progress={getTutorialProgress(tutorial.id)}
                    onStart={() => {
                      startTutorial(tutorial.id)
                      onOpenChange(false)
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {filteredTutorials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No completed tutorials yet.</p>
                <p className="text-slate-500 text-sm mt-2">Complete a tutorial to see it here.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTutorials.map((tutorial) => (
                  <TutorialCard
                    key={tutorial.id}
                    id={tutorial.id}
                    title={tutorial.title}
                    description={tutorial.description}
                    difficulty={tutorial.difficulty}
                    duration={tutorial.duration}
                    completed={isTutorialComplete(tutorial.id)}
                    progress={getTutorialProgress(tutorial.id)}
                    onStart={() => {
                      startTutorial(tutorial.id)
                      onOpenChange(false)
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={resetAllTutorials} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset All Tutorials
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TutorialCardProps {
  id: TutorialId
  title: string
  description: string
  difficulty: DifficultyLevel
  duration: number
  completed: boolean
  progress: number
  onStart: () => void
}

function TutorialCard({
  id,
  title,
  description,
  difficulty,
  duration,
  completed,
  progress,
  onStart,
}: TutorialCardProps) {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  }

  return (
    <Card className={cn(completed ? "border-green-200 dark:border-green-900" : "")}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <span className={cn("text-xs px-2 py-1 rounded-full", difficultyColors[difficulty])}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration} min
            </span>
          </div>
          {completed && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 flex justify-between items-center">
        {!completed && progress > 0 && (
          <div className="flex items-center gap-2 flex-1">
            <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-slate-500">{progress}%</span>
          </div>
        )}
        {!completed && progress === 0 && <div className="flex-1" />}
        {completed && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
          </div>
        )}
        <Button
          variant={completed ? "outline" : "default"}
          size="sm"
          onClick={onStart}
          className="ml-2 flex items-center gap-1"
        >
          {completed ? "Review" : "Start"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
