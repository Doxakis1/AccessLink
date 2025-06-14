"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Paperclip, Plus, Trash2, X, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { addReport, type ReportCategory, type ReportSeverity, type Person, type Evidence } from "@/lib/reports"
import { useToast } from "@/hooks/use-toast"

interface CreateIncidentReportProps {
  onReportCreated: (reportId: string) => void
  onCancel: () => void
}

export function CreateIncidentReport({ onReportCreated, onCancel }: CreateIncidentReportProps) {
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  // Basic report info
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ReportCategory>("incident")
  const [location, setLocation] = useState("")
  const [severity, setSeverity] = useState<ReportSeverity>("medium")
  const [reportType, setReportType] = useState<"accessibility" | "incident" | "hazard" | "other">("incident")

  // Incident specific info
  const [incidentDate, setIncidentDate] = useState("")
  const [incidentTime, setIncidentTime] = useState("")
  const [actionsTaken, setActionsTaken] = useState("")
  const [followUpActions, setFollowUpActions] = useState("")

  // People involved
  const [involvedParties, setInvolvedParties] = useState<Person[]>([])
  const [newPersonName, setNewPersonName] = useState("")
  const [newPersonRole, setNewPersonRole] = useState("")
  const [newPersonContact, setNewPersonContact] = useState("")

  // Witnesses
  const [witnesses, setWitnesses] = useState<Person[]>([])
  const [newWitnessName, setNewWitnessName] = useState("")
  const [newWitnessRole, setNewWitnessRole] = useState("")
  const [newWitnessContact, setNewWitnessContact] = useState("")

  // Evidence
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [images, setImages] = useState<string[]>([])

  // Form state
  const [currentTab, setCurrentTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target?.result) {
        const newImage = event.target.result as string
        setImages([...images, newImage])

        // Also add to evidence
        const newEvidence: Evidence = {
          id: `temp_${Date.now()}`,
          type: "image",
          url: newImage,
          description: `Image uploaded on ${new Date().toLocaleString()}`,
          dateAdded: new Date().toISOString(),
        }
        setEvidence([...evidence, newEvidence])
      }
    }

    reader.readAsDataURL(file)
    e.target.value = "" // Reset input
  }

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // In a real app, we would upload this to a server
    // For now, we'll just create a placeholder
    const newEvidence: Evidence = {
      id: `temp_${Date.now()}`,
      type: "document",
      url: "#",
      description: `Document: ${file.name}`,
      dateAdded: new Date().toISOString(),
    }

    setEvidence([...evidence, newEvidence])
    e.target.value = "" // Reset input

    toast({
      title: "Document added",
      description: `${file.name} has been added to the report.`,
    })
  }

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const removedImage = images[index]
    setImages(images.filter((_, i) => i !== index))

    // Also remove from evidence
    setEvidence(evidence.filter((e) => e.type !== "image" || e.url !== removedImage))
  }

  // Handle evidence removal
  const handleRemoveEvidence = (id: string) => {
    setEvidence(evidence.filter((e) => e.id !== id))
  }

  // Add involved party
  const handleAddInvolvedParty = () => {
    if (!newPersonName || !newPersonRole) return

    const newPerson: Person = {
      name: newPersonName,
      role: newPersonRole,
      contactInfo: newPersonContact || undefined,
    }

    setInvolvedParties([...involvedParties, newPerson])
    setNewPersonName("")
    setNewPersonRole("")
    setNewPersonContact("")
  }

  // Remove involved party
  const handleRemoveInvolvedParty = (index: number) => {
    setInvolvedParties(involvedParties.filter((_, i) => i !== index))
  }

  // Add witness
  const handleAddWitness = () => {
    if (!newWitnessName || !newWitnessRole) return

    const newWitness: Person = {
      name: newWitnessName,
      role: newWitnessRole,
      contactInfo: newWitnessContact || undefined,
    }

    setWitnesses([...witnesses, newWitness])
    setNewWitnessName("")
    setNewWitnessRole("")
    setNewWitnessContact("")
  }

  // Remove witness
  const handleRemoveWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index))
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

    if (category === "incident" && !incidentDate) {
      newErrors.incidentDate = "Incident date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Show error toast
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create location object
      const locationObj = {
        address: location,
      }

      // Add report to local storage
      const newReport = addReport({
        title,
        description,
        category,
        location: locationObj,
        severity,
        status: "active",
        createdBy: "Current User", // In a real app, this would be the current user's name
        images: images.length > 0 ? images : undefined,
        reportType,
        incidentDate,
        incidentTime,
        involvedParties: involvedParties.length > 0 ? involvedParties : undefined,
        witnesses: witnesses.length > 0 ? witnesses : undefined,
        actionsTaken: actionsTaken || undefined,
        followUpActions: followUpActions || undefined,
        evidence: evidence.length > 0 ? evidence : undefined,
      })

      toast({
        title: "Report Created",
        description: "Your incident report has been successfully created.",
      })

      onReportCreated(newReport.id)
    } catch (error) {
      console.error("Error creating report:", error)
      toast({
        title: "Error",
        description: "There was an error creating your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigate between tabs
  const handleNextTab = () => {
    if (currentTab === "basic") setCurrentTab("details")
    else if (currentTab === "details") setCurrentTab("people")
    else if (currentTab === "people") setCurrentTab("evidence")
    else if (currentTab === "evidence") setCurrentTab("review")
  }

  const handlePrevTab = () => {
    if (currentTab === "review") setCurrentTab("evidence")
    else if (currentTab === "evidence") setCurrentTab("people")
    else if (currentTab === "people") setCurrentTab("details")
    else if (currentTab === "details") setCurrentTab("basic")
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Incident Report</CardTitle>
          <CardDescription>
            Please provide detailed information about the incident to help us address it effectively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-8">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="people">People</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className={errors.title ? "text-red-500" : ""}>
                    Report Title*
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief title describing the incident"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type*</Label>
                  <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="accessibility">Accessibility Issue</SelectItem>
                      <SelectItem value="hazard">Hazard</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">Incident</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="location" className={errors.location ? "text-red-500" : ""}>
                    Location*
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Address or description of location"
                    className={errors.location ? "border-red-500" : ""}
                  />
                  {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Severity*</Label>
                  <RadioGroup
                    value={severity}
                    onValueChange={(value: any) => setSeverity(value)}
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

                <div className="pt-4 flex justify-end">
                  <Button type="button" onClick={handleNextTab}>
                    Next: Incident Details
                  </Button>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
                    Description*
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of what happened"
                    className={`min-h-[150px] ${errors.description ? "border-red-500" : ""}`}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident-date" className={errors.incidentDate ? "text-red-500" : ""}>
                      Incident Date*
                    </Label>
                    <div className="relative">
                      <Input
                        id="incident-date"
                        type="date"
                        value={incidentDate}
                        onChange={(e) => setIncidentDate(e.target.value)}
                        className={errors.incidentDate ? "border-red-500" : ""}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.incidentDate && <p className="text-sm text-red-500">{errors.incidentDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incident-time">Incident Time (if known)</Label>
                    <div className="relative">
                      <Input
                        id="incident-time"
                        type="time"
                        value={incidentTime}
                        onChange={(e) => setIncidentTime(e.target.value)}
                      />
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actions-taken">Actions Already Taken</Label>
                  <Textarea
                    id="actions-taken"
                    value={actionsTaken}
                    onChange={(e) => setActionsTaken(e.target.value)}
                    placeholder="Describe any actions that have already been taken to address this incident"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="follow-up">Recommended Follow-up Actions</Label>
                  <Textarea
                    id="follow-up"
                    value={followUpActions}
                    onChange={(e) => setFollowUpActions(e.target.value)}
                    placeholder="Suggest any follow-up actions that should be taken"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevTab}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNextTab}>
                    Next: People Involved
                  </Button>
                </div>
              </TabsContent>

              {/* People Tab */}
              <TabsContent value="people" className="space-y-6">
                {/* Involved Parties */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Involved Parties</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="person-name">Name</Label>
                      <Input
                        id="person-name"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="person-role">Role</Label>
                      <Input
                        id="person-role"
                        value={newPersonRole}
                        onChange={(e) => setNewPersonRole(e.target.value)}
                        placeholder="e.g., Visitor, Employee"
                      />
                    </div>
                    <div>
                      <Label htmlFor="person-contact">Contact Info (Optional)</Label>
                      <Input
                        id="person-contact"
                        value={newPersonContact}
                        onChange={(e) => setNewPersonContact(e.target.value)}
                        placeholder="Phone or email"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddInvolvedParty}
                    disabled={!newPersonName || !newPersonRole}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Person
                  </Button>

                  {involvedParties.length > 0 && (
                    <div className="border rounded-md p-4 space-y-3">
                      <h4 className="text-sm font-medium">Added People:</h4>
                      {involvedParties.map((person, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-md"
                        >
                          <div>
                            <p className="font-medium">{person.name}</p>
                            <p className="text-sm text-slate-500">
                              {person.role} {person.contactInfo && `• ${person.contactInfo}`}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveInvolvedParty(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Witnesses */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium">Witnesses</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="witness-name">Name</Label>
                      <Input
                        id="witness-name"
                        value={newWitnessName}
                        onChange={(e) => setNewWitnessName(e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="witness-role">Role</Label>
                      <Input
                        id="witness-role"
                        value={newWitnessRole}
                        onChange={(e) => setNewWitnessRole(e.target.value)}
                        placeholder="e.g., Bystander, Staff"
                      />
                    </div>
                    <div>
                      <Label htmlFor="witness-contact">Contact Info (Optional)</Label>
                      <Input
                        id="witness-contact"
                        value={newWitnessContact}
                        onChange={(e) => setNewWitnessContact(e.target.value)}
                        placeholder="Phone or email"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddWitness}
                    disabled={!newWitnessName || !newWitnessRole}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Witness
                  </Button>

                  {witnesses.length > 0 && (
                    <div className="border rounded-md p-4 space-y-3">
                      <h4 className="text-sm font-medium">Added Witnesses:</h4>
                      {witnesses.map((witness, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-md"
                        >
                          <div>
                            <p className="font-medium">{witness.name}</p>
                            <p className="text-sm text-slate-500">
                              {witness.role} {witness.contactInfo && `• ${witness.contactInfo}`}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveWitness(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevTab}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNextTab}>
                    Next: Evidence
                  </Button>
                </div>
              </TabsContent>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Photos</h3>
                  <p className="text-sm text-slate-500">
                    Upload photos related to the incident (e.g., location, damage, conditions).
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Evidence image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      </div>
                    ))}

                    {images.length < 8 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="aspect-square flex flex-col items-center justify-center gap-1 text-xs h-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-8 w-8 mb-1" />
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
                  />
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium">Documents</h3>
                  <p className="text-sm text-slate-500">
                    Upload any relevant documents (e.g., incident forms, medical reports, correspondence).
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => documentInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    Attach Document
                  </Button>

                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />

                  {evidence.filter((e) => e.type === "document").length > 0 && (
                    <div className="border rounded-md p-4 space-y-3">
                      <h4 className="text-sm font-medium">Attached Documents:</h4>
                      {evidence
                        .filter((e) => e.type === "document")
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-slate-400" />
                              <span>{doc.description}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEvidence(doc.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevTab}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNextTab}>
                    Next: Review Report
                  </Button>
                </div>
              </TabsContent>

              {/* Review Tab */}
              <TabsContent value="review" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Report Summary</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-xl font-bold">{title || "[No Title]"}</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{reportType}</Badge>
                          <Badge variant="outline">{category}</Badge>
                          <Badge
                            className={
                              severity === "critical"
                                ? "bg-red-500"
                                : severity === "high"
                                  ? "bg-orange-500"
                                  : severity === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }
                          >
                            {severity}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Location:</p>
                          <p>{location || "[Not specified]"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Date & Time:</p>
                          <p>
                            {incidentDate ? new Date(incidentDate).toLocaleDateString() : "[Not specified]"}
                            {incidentTime ? ` at ${incidentTime}` : ""}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium">Description:</p>
                        <p className="whitespace-pre-wrap">{description || "[No description provided]"}</p>
                      </div>

                      {actionsTaken && (
                        <div>
                          <p className="font-medium">Actions Taken:</p>
                          <p className="whitespace-pre-wrap">{actionsTaken}</p>
                        </div>
                      )}

                      {followUpActions && (
                        <div>
                          <p className="font-medium">Follow-up Actions:</p>
                          <p className="whitespace-pre-wrap">{followUpActions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {involvedParties.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Involved Parties ({involvedParties.length})</h3>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                        <div className="space-y-2">
                          {involvedParties.map((person, index) => (
                            <div key={index} className="border-b last:border-0 pb-2 last:pb-0">
                              <p className="font-medium">{person.name}</p>
                              <p className="text-sm text-slate-500">
                                {person.role} {person.contactInfo && `• ${person.contactInfo}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {witnesses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Witnesses ({witnesses.length})</h3>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                        <div className="space-y-2">
                          {witnesses.map((person, index) => (
                            <div key={index} className="border-b last:border-0 pb-2 last:pb-0">
                              <p className="font-medium">{person.name}</p>
                              <p className="text-sm text-slate-500">
                                {person.role} {person.contactInfo && `• ${person.contactInfo}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {evidence.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Evidence ({evidence.length})</h3>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                        {evidence.filter((e) => e.type === "image").length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Photos:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {evidence
                                .filter((e) => e.type === "image")
                                .map((img) => (
                                  <div key={img.id} className="aspect-square rounded-md overflow-hidden border">
                                    <img
                                      src={img.url || "/placeholder.svg"}
                                      alt={img.description}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {evidence.filter((e) => e.type === "document").length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Documents:</h4>
                            <div className="space-y-2">
                              {evidence
                                .filter((e) => e.type === "document")
                                .map((doc) => (
                                  <div key={doc.id} className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-slate-400" />
                                    <span>{doc.description}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevTab}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="text-sm text-slate-500">
            {currentTab === "basic"
              ? "Step 1 of 5"
              : currentTab === "details"
                ? "Step 2 of 5"
                : currentTab === "people"
                  ? "Step 3 of 5"
                  : currentTab === "evidence"
                    ? "Step 4 of 5"
                    : "Step 5 of 5"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
