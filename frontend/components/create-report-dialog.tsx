"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { addReport, type ReportCategory, type ReportSeverity } from "@/lib/reports"

interface CreateReportDialogProps {
  isOpen: boolean
  onClose: () => void
  onReportCreated: () => void
}

export function CreateReportDialog({ isOpen, onClose, onReportCreated }: CreateReportDialogProps) {
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ReportCategory>("other")
  const [location, setLocation] = useState("")
  const [severity, setSeverity] = useState<ReportSeverity>("medium")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Refs
  const titleInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetForm()
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Reset form
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory("other")
    setLocation("")
    setSeverity("medium")
    setImages([])
    setErrors({})
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!location.trim()) {
      newErrors.location = "Location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Add report to local storage
      addReport({
        title,
        description,
        category,
        location,
        severity,
        status: "active",
        createdBy: "Current User", // In a real app, this would be the current user's name
        images: images.length > 0 ? images : undefined,
      })

      onReportCreated()
    } catch (error) {
      console.error("Error creating report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target?.result) {
        setImages([...images, event.target.result as string])
      }
    }

    reader.readAsDataURL(file)
    e.target.value = "" // Reset input
  }

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Accessibility Issue</DialogTitle>
          <DialogDescription>Help improve accessibility by reporting issues in your area.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className={errors.title ? "text-red-500" : ""}>
              Title*
            </Label>
            <Input
              id="title"
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-500">
                {errors.title}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category*</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ReportCategory)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
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

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className={errors.location ? "text-red-500" : ""}>
              Location*
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Address or description of location"
              className={errors.location ? "border-red-500 focus-visible:ring-red-500" : ""}
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? "location-error" : undefined}
            />
            {errors.location && (
              <p id="location-error" className="text-sm text-red-500">
                {errors.location}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
              Description*
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the accessibility issue"
              className={`min-h-[100px] ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Severity*</Label>
            <RadioGroup
              value={severity}
              onValueChange={(value) => setSeverity(value as ReportSeverity)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="severity-low" />
                <Label htmlFor="severity-low" className="cursor-pointer">
                  Low
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="severity-medium" />
                <Label htmlFor="severity-medium" className="cursor-pointer">
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="severity-high" />
                <Label htmlFor="severity-high" className="cursor-pointer">
                  High
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critical" id="severity-critical" />
                <Label htmlFor="severity-critical" className="cursor-pointer">
                  Critical
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images (Optional)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
              ))}
              {images.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  className="aspect-square flex flex-col items-center justify-center gap-1 text-xs"
                  onClick={triggerFileInput}
                >
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  <span>Add Photo</span>
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload image"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
