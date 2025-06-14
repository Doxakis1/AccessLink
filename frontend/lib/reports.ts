// Define report types
export type ReportCategory =
  | "elevator"
  | "stairs"
  | "ramp"
  | "door"
  | "parking"
  | "bathroom"
  | "sidewalk"
  | "crossing"
  | "incident"
  | "other"

export type ReportSeverity = "low" | "medium" | "high" | "critical"

export type ReportStatus = "active" | "in_progress" | "resolved" | "closed"

export interface Location {
  address: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface Person {
  name: string
  role: string
  contactInfo?: string
}

export interface Evidence {
  id: string
  type: "image" | "document" | "audio" | "video"
  url: string
  description: string
  dateAdded: string
}

export interface Report {
  id: string
  title: string
  description: string
  category: ReportCategory
  location: Location
  severity: ReportSeverity
  status: ReportStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  upvotes: number
  comments: ReportComment[]
  images?: string[]
  // New fields for comprehensive incident reports
  incidentDate?: string
  incidentTime?: string
  involvedParties?: Person[]
  actionsTaken?: string
  evidence?: Evidence[]
  witnesses?: Person[]
  followUpActions?: string
  reportType?: "accessibility" | "incident" | "hazard" | "other"
}

export interface ReportComment {
  id: string
  text: string
  createdAt: string
  createdBy: string
}

// Get all reports from local storage
export function getReports(): Report[] {
  if (typeof window === "undefined") return []

  try {
    const reports = localStorage.getItem("accessibility_reports")
    return reports ? JSON.parse(reports) : []
  } catch (error) {
    console.error("Error retrieving reports:", error)
    return []
  }
}

// Save reports to local storage
export function saveReports(reports: Report[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("accessibility_reports", JSON.stringify(reports))
  } catch (error) {
    console.error("Error saving reports:", error)
  }
}

// Add a new report
export function addReport(report: Omit<Report, "id" | "createdAt" | "updatedAt" | "upvotes" | "comments">): Report {
  const reports = getReports()

  const newReport: Report = {
    ...report,
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    upvotes: 0,
    comments: [],
  }

  saveReports([...reports, newReport])
  return newReport
}

// Get a report by ID
export function getReportById(id: string): Report | undefined {
  const reports = getReports()
  return reports.find((report) => report.id === id)
}

// Update a report
export function updateReport(updatedReport: Report): void {
  const reports = getReports()
  const index = reports.findIndex((report) => report.id === updatedReport.id)

  if (index !== -1) {
    reports[index] = {
      ...updatedReport,
      updatedAt: new Date().toISOString(),
    }
    saveReports(reports)
  }
}

// Delete a report
export function deleteReport(id: string): void {
  const reports = getReports()
  const filteredReports = reports.filter((report) => report.id !== id)
  saveReports(filteredReports)
}

// Add a comment to a report
export function addComment(reportId: string, text: string, createdBy: string): void {
  const reports = getReports()
  const index = reports.findIndex((report) => report.id === reportId)

  if (index !== -1) {
    const newComment: ReportComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      createdAt: new Date().toISOString(),
      createdBy,
    }

    reports[index].comments.push(newComment)
    reports[index].updatedAt = new Date().toISOString()
    saveReports(reports)
  }
}

// Upvote a report
export function upvoteReport(id: string): void {
  const reports = getReports()
  const index = reports.findIndex((report) => report.id === id)

  if (index !== -1) {
    reports[index].upvotes += 1
    saveReports(reports)
  }
}

// Add evidence to a report
export function addEvidence(reportId: string, evidence: Omit<Evidence, "id" | "dateAdded">): void {
  const reports = getReports()
  const index = reports.findIndex((report) => report.id === reportId)

  if (index !== -1) {
    const newEvidence: Evidence = {
      ...evidence,
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date().toISOString(),
    }

    if (!reports[index].evidence) {
      reports[index].evidence = []
    }

    reports[index].evidence.push(newEvidence)
    reports[index].updatedAt = new Date().toISOString()
    saveReports(reports)
  }
}

// Remove evidence from a report
export function removeEvidence(reportId: string, evidenceId: string): void {
  const reports = getReports()
  const index = reports.findIndex((report) => report.id === reportId)

  if (index !== -1 && reports[index].evidence) {
    reports[index].evidence = reports[index].evidence.filter((evidence) => evidence.id !== evidenceId)
    reports[index].updatedAt = new Date().toISOString()
    saveReports(reports)
  }
}

// Add involved party to a report
export function addInvolvedParty(reportId: string, person: Person): void {
  const reports = getReports()
  const index = reports.findIndex((report) => report.id === reportId)

  if (index !== -1) {
    if (!reports[index].involvedParties) {
      reports[index].involvedParties = []
    }

    reports[index].involvedParties.push(person)
    reports[index].updatedAt = new Date().toISOString()
    saveReports(reports)
  }
}

// Remove involved party from a report
export function removeInvolvedParty(reportId: string, personName: string): void {
  const reports = getReports()
  const index = reports.findIndex((report) => report.id === reportId)

  if (index !== -1 && reports[index].involvedParties) {
    reports[index].involvedParties = reports[index].involvedParties.filter((person) => person.name !== personName)
    reports[index].updatedAt = new Date().toISOString()
    saveReports(reports)
  }
}

// Export report as JSON
export function exportReportAsJSON(id: string): string {
  const report = getReportById(id)
  if (!report) return ""
  return JSON.stringify(report, null, 2)
}

// Export report as CSV
export function exportReportAsCSV(id: string): string {
  const report = getReportById(id)
  if (!report) return ""

  // Basic report fields
  let csv = `"Report ID","Title","Category","Severity","Status","Created At","Created By","Location"\n`
  csv += `"${report.id}","${report.title}","${report.category}","${report.severity}","${report.status}","${report.createdAt}","${report.createdBy}","${report.location.address}"\n\n`

  // Description
  csv += `"Description"\n"${report.description.replace(/"/g, '""')}"\n\n`

  // Incident specific fields
  if (report.incidentDate) {
    csv += `"Incident Date","Incident Time"\n"${report.incidentDate}","${report.incidentTime || ""}"\n\n`
  }

  // Actions taken
  if (report.actionsTaken) {
    csv += `"Actions Taken"\n"${report.actionsTaken.replace(/"/g, '""')}"\n\n`
  }

  // Follow-up actions
  if (report.followUpActions) {
    csv += `"Follow-up Actions"\n"${report.followUpActions.replace(/"/g, '""')}"\n\n`
  }

  // Involved parties
  if (report.involvedParties && report.involvedParties.length > 0) {
    csv += `"Involved Parties"\n"Name","Role","Contact Info"\n`
    report.involvedParties.forEach((person) => {
      csv += `"${person.name}","${person.role}","${person.contactInfo || ""}"\n`
    })
    csv += "\n"
  }

  // Witnesses
  if (report.witnesses && report.witnesses.length > 0) {
    csv += `"Witnesses"\n"Name","Role","Contact Info"\n`
    report.witnesses.forEach((person) => {
      csv += `"${person.name}","${person.role}","${person.contactInfo || ""}"\n`
    })
    csv += "\n"
  }

  // Evidence
  if (report.evidence && report.evidence.length > 0) {
    csv += `"Evidence"\n"Type","Description","Date Added"\n`
    report.evidence.forEach((item) => {
      csv += `"${item.type}","${item.description.replace(/"/g, '""')}","${item.dateAdded}"\n`
    })
    csv += "\n"
  }

  // Comments
  if (report.comments.length > 0) {
    csv += `"Comments"\n"Comment","Created By","Created At"\n`
    report.comments.forEach((comment) => {
      csv += `"${comment.text.replace(/"/g, '""')}","${comment.createdBy}","${comment.createdAt}"\n`
    })
  }

  return csv
}

// Get sample reports (for demo purposes)
export function getSampleReports(): Report[] {
  return [
    {
      id: "report_1",
      title: "Broken Elevator at Central Station",
      description:
        "The main elevator at the north entrance of Central Station has been out of service for three days. This is causing significant accessibility issues for wheelchair users and people with mobility impairments.",
      category: "elevator",
      location: {
        address: "Central Station, North Entrance",
        coordinates: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
      severity: "high",
      status: "active",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Alex Johnson",
      upvotes: 12,
      comments: [
        {
          id: "comment_1",
          text: "I encountered this issue yesterday too. Had to go all the way around to the south entrance.",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: "Maria Garcia",
        },
      ],
      reportType: "accessibility",
    },
    {
      id: "report_2",
      title: "Missing Handrail on Public Library Steps",
      description:
        "The handrail on the right side of the main entrance steps at the Public Library is missing. This creates a safety hazard, especially for elderly visitors and those with balance issues.",
      category: "stairs",
      location: {
        address: "Public Library, Main Entrance",
      },
      severity: "medium",
      status: "in_progress",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Sam Wilson",
      upvotes: 8,
      comments: [
        {
          id: "comment_2",
          text: "I spoke with the library staff and they said repairs are scheduled for next week.",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: "Sam Wilson",
        },
      ],
      reportType: "hazard",
    },
    {
      id: "report_3",
      title: "Steep Ramp at Community Center",
      description:
        "The wheelchair ramp at the Community Center is too steep and doesn't meet accessibility standards. It's very difficult to navigate independently.",
      category: "ramp",
      location: {
        address: "Community Center, West Entrance",
      },
      severity: "high",
      status: "active",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Taylor Kim",
      upvotes: 15,
      comments: [],
      reportType: "accessibility",
    },
    {
      id: "report_4",
      title: "Fall Incident at Medical Center Entrance",
      description:
        "An elderly visitor fell at the entrance of the Medical Center due to uneven pavement. The incident occurred when they were trying to enter the building and tripped on a raised section of the walkway.",
      category: "incident",
      location: {
        address: "Medical Center, Main Entrance",
        coordinates: {
          latitude: 40.7135,
          longitude: -74.0046,
        },
      },
      severity: "critical",
      status: "active",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Jordan Smith",
      upvotes: 6,
      comments: [],
      reportType: "incident",
      incidentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      incidentTime: "14:30",
      involvedParties: [
        {
          name: "Pat Johnson",
          role: "Visitor",
          contactInfo: "555-123-4567",
        },
        {
          name: "Dr. Lee",
          role: "Medical Staff",
          contactInfo: "555-987-6543",
        },
      ],
      actionsTaken:
        "First aid was administered by Dr. Lee. The visitor was taken to the emergency room for further evaluation. The facilities team was notified about the uneven pavement.",
      witnesses: [
        {
          name: "Robin Taylor",
          role: "Receptionist",
          contactInfo: "555-246-8135",
        },
      ],
      followUpActions:
        "Facilities team scheduled to repair the pavement on Friday. Follow-up call to check on visitor's condition.",
      evidence: [
        {
          id: "evidence_1",
          type: "image",
          url: "/placeholder.svg?height=300&width=400",
          description: "Photo of the uneven pavement where the incident occurred",
          dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "evidence_2",
          type: "document",
          url: "#",
          description: "Incident report filed with Medical Center administration",
          dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "report_5",
      title: "Uneven Sidewalk on Main Street",
      description:
        "There's a severely uneven section of sidewalk on Main Street between Oak and Pine Avenue. The concrete has buckled creating a tripping hazard and making it impossible for wheelchair users to pass.",
      category: "sidewalk",
      location: {
        address: "Main Street between Oak and Pine Avenue",
        coordinates: {
          latitude: 40.7139,
          longitude: -74.0079,
        },
      },
      severity: "medium",
      status: "in_progress",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "Casey Martinez",
      upvotes: 9,
      comments: [
        {
          id: "comment_3",
          text: "City maintenance has marked this area with orange paint, so I think they're planning to fix it soon.",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: "Robin Lee",
        },
      ],
      reportType: "hazard",
    },
  ]
}

// Initialize reports with sample data if none exist
export function initializeReports(): void {
  if (typeof window === "undefined") return

  const reports = getReports()
  if (reports.length === 0) {
    saveReports(getSampleReports())
  }
}
