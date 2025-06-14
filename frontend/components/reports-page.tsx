"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, SortAsc, SortDesc, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateReportDialog } from "@/components/create-report-dialog"
import { ReportDetailDialog } from "@/components/report-detail-dialog"
import { ReportFilters } from "@/components/report-filters"
import { CreateIncidentReport } from "@/components/create-incident-report"
import { ReportDetailView } from "@/components/report-detail-view"
import { getReports, initializeReports, type Report } from "@/lib/reports"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreateIncidentReportOpen, setIsCreateIncidentReportOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState<"all" | "accessibility" | "incidents" | "hazards">("all")

  // Initialize reports
  useEffect(() => {
    initializeReports()
    loadReports()
  }, [])

  // Load reports from local storage
  const loadReports = () => {
    const loadedReports = getReports()
    setReports(loadedReports)
    setFilteredReports(loadedReports)
  }

  // Filter reports based on search query and active tab
  useEffect(() => {
    let filtered = [...reports]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          report.location.address.toLowerCase().includes(query) ||
          report.category.toLowerCase().includes(query),
      )
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((report) => report.reportType === activeTab)
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

    setFilteredReports(filtered)
  }, [reports, searchQuery, sortOrder, activeTab])

  // Handle report creation
  const handleReportCreated = () => {
    loadReports()
    setIsCreateDialogOpen(false)
    setIsCreateIncidentReportOpen(false)
    toast({
      title: "Report Created",
      description: "Your report has been successfully created.",
    })
  }

  // Handle report selection
  const handleReportClick = (report: Report) => {
    setSelectedReport(report)

    // Use the detailed view for incident reports, otherwise use the simple dialog
    if (report.reportType === "incident") {
      setIsDetailViewOpen(true)
    } else {
      setIsDetailDialogOpen(true)
    }
  }

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 hover:bg-red-700"
      case "high":
        return "bg-orange-500 hover:bg-orange-600"
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "low":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-slate-500 hover:bg-slate-600"
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500 hover:bg-blue-600"
      case "in_progress":
        return "bg-purple-500 hover:bg-purple-600"
      case "resolved":
        return "bg-green-500 hover:bg-green-600"
      case "closed":
        return "bg-slate-500 hover:bg-slate-600"
      default:
        return "bg-slate-500 hover:bg-slate-600"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "elevator":
        return "🛗"
      case "stairs":
        return "🪜"
      case "ramp":
        return "📐"
      case "door":
        return "🚪"
      case "parking":
        return "🅿️"
      case "bathroom":
        return "🚻"
      case "sidewalk":
        return "🛣️"
      case "crossing":
        return "🚶"
      case "incident":
        return "⚠️"
      default:
        return "⚠️"
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-slate-500">View and create accessibility reports and incident reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Accessibility Report
          </Button>
          <Button onClick={() => setIsCreateIncidentReportOpen(true)} variant="secondary">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Incident Report
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
          >
            {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsFiltersOpen(true)} title="Filter reports">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mb-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="incident">Incidents</TabsTrigger>
          <TabsTrigger value="hazard">Hazards</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleReportClick(report)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>{getCategoryIcon(report.category)}</span>
                  <span className="line-clamp-1">{report.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-slate-500 line-clamp-2 mb-3">{report.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{report.category}</Badge>
                  <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                  <Badge className={getStatusColor(report.status)}>{report.status.replace("_", " ")}</Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-slate-500">
                <div>{formatDate(report.createdAt)}</div>
                <div className="flex items-center gap-1">
                  <span>👍</span>
                  <span>{report.upvotes}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl font-medium mb-2">No reports found</p>
          <p className="text-slate-500 mb-6">
            {searchQuery ? "Try adjusting your search or filters" : "Create a new report to get started"}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Accessibility Report
            </Button>
            <Button onClick={() => setIsCreateIncidentReportOpen(true)} variant="secondary">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Create Incident Report
            </Button>
          </div>
        </div>
      )}

      {/* Create Report Dialog */}
      <CreateReportDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onReportCreated={handleReportCreated}
      />

      {/* Create Incident Report */}
      {isCreateIncidentReportOpen && (
        <CreateIncidentReport
          onReportCreated={handleReportCreated}
          onCancel={() => setIsCreateIncidentReportOpen(false)}
        />
      )}

      {/* Report Detail Dialog */}
      {selectedReport && (
        <ReportDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          report={selectedReport}
          onReportUpdated={loadReports}
        />
      )}

      {/* Detailed Report View */}
      {selectedReport && (
        <ReportDetailView
          isOpen={isDetailViewOpen}
          onClose={() => setIsDetailViewOpen(false)}
          report={selectedReport}
          onReportUpdated={loadReports}
        />
      )}

      {/* Report Filters */}
      <ReportFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onFiltersApplied={() => {
          // In a real app, this would apply filters
          setIsFiltersOpen(false)
        }}
      />
    </div>
  )
}
