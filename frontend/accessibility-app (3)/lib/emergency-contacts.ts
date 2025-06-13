// Define the emergency contact type
export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phoneNumber: string
  priority: number // 1 = highest priority
}

// Get contacts from localStorage
export function getEmergencyContacts(): EmergencyContact[] {
  if (typeof window === "undefined") return []

  try {
    const contacts = localStorage.getItem("emergencyContacts")
    return contacts ? JSON.parse(contacts) : []
  } catch (error) {
    console.error("Error retrieving emergency contacts:", error)
    return []
  }
}

// Save contacts to localStorage
export function saveEmergencyContacts(contacts: EmergencyContact[]): void {
  if (typeof window === "undefined") return

  try {
    // Sort by priority before saving
    const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority)
    localStorage.setItem("emergencyContacts", JSON.stringify(sortedContacts))
  } catch (error) {
    console.error("Error saving emergency contacts:", error)
  }
}

// Add a new contact
export function addEmergencyContact(contact: Omit<EmergencyContact, "id">): EmergencyContact {
  const contacts = getEmergencyContacts()
  const newContact = {
    ...contact,
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }

  saveEmergencyContacts([...contacts, newContact])
  return newContact
}

// Update an existing contact
export function updateEmergencyContact(contact: EmergencyContact): void {
  const contacts = getEmergencyContacts()
  const index = contacts.findIndex((c) => c.id === contact.id)

  if (index !== -1) {
    contacts[index] = contact
    saveEmergencyContacts(contacts)
  }
}

// Delete a contact
export function deleteEmergencyContact(id: string): void {
  const contacts = getEmergencyContacts()
  const filteredContacts = contacts.filter((contact) => contact.id !== id)
  saveEmergencyContacts(filteredContacts)
}

// Format phone number for display
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "")

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Return original if we can't format it
  return phoneNumber
}
