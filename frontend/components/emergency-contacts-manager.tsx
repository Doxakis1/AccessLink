"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Plus, Edit, Trash2, Phone, User, Users, ChevronUp, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type EmergencyContact,
  getEmergencyContacts,
  saveEmergencyContacts,
  formatPhoneNumber,
} from "@/lib/emergency-contacts"

interface EmergencyContactsManagerProps {
  onCallContact?: (contact: EmergencyContact) => void
}

export function EmergencyContactsManager({ onCallContact }: EmergencyContactsManagerProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentContact, setCurrentContact] = useState<EmergencyContact | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phoneNumber: "",
    priority: 1,
  })
  const [formErrors, setFormErrors] = useState({
    name: "",
    phoneNumber: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isCalling, setIsCalling] = useState(false)

  // State for tracking which contact is in confirmation mode for calling
  const [confirmingCallId, setConfirmingCallId] = useState<string | null>(null)

  // State for tracking swipe actions
  const [swipeState, setSwipeState] = useState<{
    contactId: string | null
    startX: number
    currentX: number
    action: "none" | "delete" | "edit"
  }>({
    contactId: null,
    startX: 0,
    currentX: 0,
    action: "none",
  })

  const nameInputRef = useRef<HTMLInputElement>(null)
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load contacts on mount
  useEffect(() => {
    const loadedContacts = getEmergencyContacts()
    setContacts(loadedContacts)
  }, [])

  // Reset call confirmation after timeout
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (confirmingCallId) {
      timer = setTimeout(() => {
        setConfirmingCallId(null)
      }, 5000) // 5 seconds timeout
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [confirmingCallId])

  // Focus name input when dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [isAddDialogOpen])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {
      name: "",
      phoneNumber: "",
    }

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required"
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number"
    }

    setFormErrors(errors)
    return !errors.name && !errors.phoneNumber
  }

  // Open add contact dialog
  const handleAddContact = () => {
    setFormData({
      name: "",
      relationship: "",
      phoneNumber: "",
      priority: contacts.length > 0 ? Math.max(...contacts.map((c) => c.priority)) + 1 : 1,
    })
    setIsEditing(false)
    setIsAddDialogOpen(true)
  }

  // Open edit contact dialog
  const handleEditContact = (contact: EmergencyContact) => {
    setCurrentContact(contact)
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phoneNumber: contact.phoneNumber,
      priority: contact.priority,
    })
    setIsEditing(true)
    setIsAddDialogOpen(true)
  }

  // Open delete confirmation dialog
  const handleDeleteClick = (contact: EmergencyContact) => {
    setCurrentContact(contact)
    setIsDeleteDialogOpen(true)
  }

  // Delete contact
  const confirmDelete = () => {
    if (currentContact) {
      const updatedContacts = contacts.filter((c) => c.id !== currentContact.id)
      setContacts(updatedContacts)
      saveEmergencyContacts(updatedContacts)
      setIsDeleteDialogOpen(false)
      setCurrentContact(null)
    }
  }

  // Save contact (add or edit)
  const handleSaveContact = () => {
    if (!validateForm()) return

    const updatedContacts = [...contacts]

    if (isEditing && currentContact) {
      // Update existing contact
      const index = updatedContacts.findIndex((c) => c.id === currentContact.id)
      if (index !== -1) {
        updatedContacts[index] = {
          ...currentContact,
          name: formData.name,
          relationship: formData.relationship,
          phoneNumber: formData.phoneNumber,
          priority: formData.priority,
        }
      }
    } else {
      // Add new contact
      updatedContacts.push({
        id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        relationship: formData.relationship,
        phoneNumber: formData.phoneNumber,
        priority: formData.priority,
      })
    }

    // Sort by priority
    updatedContacts.sort((a, b) => a.priority - b.priority)

    setContacts(updatedContacts)
    saveEmergencyContacts(updatedContacts)
    setIsAddDialogOpen(false)
  }

  // Move contact priority up
  const movePriorityUp = (contact: EmergencyContact) => {
    const index = contacts.findIndex((c) => c.id === contact.id)
    if (index > 0) {
      const updatedContacts = [...contacts]
      // Swap priorities
      const tempPriority = updatedContacts[index - 1].priority
      updatedContacts[index - 1].priority = updatedContacts[index].priority
      updatedContacts[index].priority = tempPriority
      // Sort by priority
      updatedContacts.sort((a, b) => a.priority - b.priority)
      setContacts(updatedContacts)
      saveEmergencyContacts(updatedContacts)
    }
  }

  // Move contact priority down
  const movePriorityDown = (contact: EmergencyContact) => {
    const index = contacts.findIndex((c) => c.id === contact.id)
    if (index < contacts.length - 1) {
      const updatedContacts = [...contacts]
      // Swap priorities
      const tempPriority = updatedContacts[index + 1].priority
      updatedContacts[index + 1].priority = updatedContacts[index].priority
      updatedContacts[index].priority = tempPriority
      // Sort by priority
      updatedContacts.sort((a, b) => a.priority - b.priority)
      setContacts(updatedContacts)
      saveEmergencyContacts(updatedContacts)
    }
  }

  // Handle call button click - two-step confirmation
  const handleCallClick = (contact: EmergencyContact) => {
    if (confirmingCallId === contact.id) {
      // Second press - initiate call
      setConfirmingCallId(null)
      if (onCallContact) {
        onCallContact(contact)
      }
    } else {
      // First press - enter confirmation mode
      setConfirmingCallId(contact.id)
    }
  }

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent, contactId: string) => {
    const touch = e.touches[0]
    setSwipeState({
      contactId,
      startX: touch.clientX,
      currentX: touch.clientX,
      action: "none",
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState.contactId) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - swipeState.startX

    // Determine action based on swipe direction
    let action: "none" | "delete" | "edit" = "none"
    if (deltaX < -50) action = "delete" // Swipe left
    if (deltaX > 50) action = "edit" // Swipe right

    setSwipeState({
      ...swipeState,
      currentX: touch.clientX,
      action,
    })
  }

  const handleTouchEnd = () => {
    if (!swipeState.contactId || swipeState.action === "none") {
      setSwipeState({
        contactId: null,
        startX: 0,
        currentX: 0,
        action: "none",
      })
      return
    }

    const contact = contacts.find((c) => c.id === swipeState.contactId)
    if (!contact) return

    // Execute action based on swipe
    if (swipeState.action === "delete") {
      handleDeleteClick(contact)
    } else if (swipeState.action === "edit") {
      handleEditContact(contact)
    }

    // Reset swipe state
    setSwipeState({
      contactId: null,
      startX: 0,
      currentX: 0,
      action: "none",
    })
  }

  // Calculate swipe styles
  const getSwipeStyles = (contactId: string) => {
    if (swipeState.contactId !== contactId) return {}

    const deltaX = swipeState.currentX - swipeState.startX
    const transform = `translateX(${deltaX}px)`
    let background = ""

    if (swipeState.action === "delete") {
      background = "linear-gradient(to right, transparent, rgba(220, 38, 38, 0.2))"
    } else if (swipeState.action === "edit") {
      background = "linear-gradient(to left, transparent, rgba(59, 130, 246, 0.2))"
    }

    return {
      transform,
      background,
      transition: "transform 0.1s ease",
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" aria-hidden="true" />
            Emergency Contacts
          </CardTitle>
          <Button onClick={handleAddContact} size="sm" className="h-8 gap-1" aria-label="Add emergency contact">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add</span>
          </Button>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              <User className="h-12 w-12 mx-auto mb-2 opacity-30" aria-hidden="true" />
              <p>No emergency contacts added yet.</p>
              <p className="text-sm mt-1">Add contacts to quickly call them in emergencies.</p>
            </div>
          ) : (
            <ul className="space-y-3" role="list" aria-label="Emergency contacts">
              {contacts.map((contact, index) => (
                <li
                  key={contact.id}
                  className="border rounded-lg p-3 bg-white dark:bg-slate-800 relative overflow-hidden"
                  aria-label={`${contact.name}, ${contact.relationship}`}
                  onTouchStart={(e) => handleTouchStart(e, contact.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={getSwipeStyles(contact.id)}
                >
                  {/* Swipe indicators */}
                  <div
                    className="absolute inset-y-0 left-0 w-16 flex items-center justify-center opacity-0 transition-opacity"
                    style={{ opacity: swipeState.contactId === contact.id && swipeState.action === "edit" ? 0.7 : 0 }}
                  >
                    <Edit className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div
                    className="absolute inset-y-0 right-0 w-16 flex items-center justify-center opacity-0 transition-opacity"
                    style={{ opacity: swipeState.contactId === contact.id && swipeState.action === "delete" ? 0.7 : 0 }}
                  >
                    <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>

                  {/* Contact info and actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{contact.name}</h3>
                      {contact.relationship && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{contact.relationship}</p>
                      )}
                      <p className="font-mono mt-1">{formatPhoneNumber(contact.phoneNumber)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 mr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => movePriorityUp(contact)}
                        disabled={index === 0}
                        aria-label={`Move ${contact.name} up in priority`}
                      >
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <span className="text-xs text-slate-500" aria-label={`Priority ${index + 1}`}>
                        {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => movePriorityDown(contact)}
                        disabled={index === contacts.length - 1}
                        aria-label={`Move ${contact.name} down in priority`}
                      >
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditContact(contact)}
                        aria-label={`Edit ${contact.name}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(contact)}
                        aria-label={`Delete ${contact.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="default"
                        size="icon"
                        className={`h-8 w-8 ${
                          confirmingCallId === contact.id
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        onClick={() => handleCallClick(contact)}
                        aria-label={
                          confirmingCallId === contact.id ? `Confirm call to ${contact.name}` : `Call ${contact.name}`
                        }
                      >
                        {confirmingCallId === contact.id ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Phone className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirmation message */}
                  {confirmingCallId === contact.id && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400 text-center">
                      Tap again to confirm call to {contact.name}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Contact" : "Add Emergency Contact"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details of your emergency contact."
                : "Add a new emergency contact that you can quickly call in case of emergency."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveContact()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className={formErrors.name ? "text-red-500" : ""}>
                Name
              </Label>
              <Input
                id="name"
                name="name"
                ref={nameInputRef}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full name"
                className={formErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? "name-error" : undefined}
              />
              {formErrors.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship: value }))}
              >
                <SelectTrigger id="relationship" aria-label="Select relationship">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Neighbor">Neighbor</SelectItem>
                  <SelectItem value="Caregiver">Caregiver</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className={formErrors.phoneNumber ? "text-red-500" : ""}>
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="(123) 456-7890"
                className={formErrors.phoneNumber ? "border-red-500 focus-visible:ring-red-500" : ""}
                aria-invalid={!!formErrors.phoneNumber}
                aria-describedby={formErrors.phoneNumber ? "phone-error" : undefined}
              />
              {formErrors.phoneNumber && (
                <p id="phone-error" className="text-sm text-red-500">
                  {formErrors.phoneNumber}
                </p>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">{isEditing ? "Update" : "Add"} Contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {currentContact?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
