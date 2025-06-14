"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { ReportCategory, ReportSeverity, ReportStatus } from "@/lib/reports"

interface ReportFiltersProps {
  isOpen: boolean
  onClose: () => void
  selectedCategory: ReportCategory | "all"
  setSelectedCategory: (category: ReportCategory | "all") => void
  selectedStatus: ReportStatus | "all"
  setSelectedStatus: (status: ReportStatus | "all") => void
  selectedSeverity: ReportSeverity | "all"
  setSelectedSeverity: (severity: ReportSeverity | "all") => void
}

export function ReportFilters({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedSeverity,
  setSelectedSeverity,
}: ReportFiltersProps) {
  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSelectedSeverity("all")
  }

  // Apply filters
  const applyFilters = () => {
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Reports</SheetTitle>
          <SheetDescription>Filter reports by category, status, and severity.</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category-filter">Category</Label>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="elevator">Elevator</SelectItem>
                <SelectItem value="stairs">Stairs</SelectItem>
                <SelectItem value="ramp">Ramp</SelectItem>
                <SelectItem value="door">Door</SelectItem>
                <SelectItem value="parking">Parking</SelectItem>
                <SelectItem value="bathroom">Bathroom</SelectItem>
                <SelectItem value="sidewalk">Sidewalk</SelectItem>
                <SelectItem value="crossing">Crossing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity Filter */}
          <div className="space-y-2">
            <Label htmlFor="severity-filter">Severity</Label>
            <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value as any)}>
              <SelectTrigger id="severity-filter">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={resetFilters} className="w-full">
            Reset Filters
          </Button>
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
