"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Clock,
  ThumbsUp,
  Send,
  Download,
  Printer,
  FileText,
  ImageIcon,
  Users,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  type Report,
  type ReportStatus,
  addComment,
  updateReport,
  upvoteReport,
  exportReportAsJSON,
  exportReportAsCSV,
} from "@/lib/reports"
import { useToast } from "@/hooks/use-toast"

interface ReportDetailViewProps {
  report: Report
  isOpen: boolean
  onClose: () => void
  onReportUpdated: () => void
}

export function ReportDetailView({ report, isOpen, onClose, onReportUpdated }: ReportDetailViewProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<ReportStatus>(report.status)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
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

  // Handle comment submission
  const handleSubmitComment = () => {
    if (!comment.trim()) return

    setIsSubmittingComment(true)

    try {
      addComment(report.id, comment, "Current User") // In a real app, this would be the current user's name
      setComment("")
      onReportUpdated()
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the report.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "There was an error adding your comment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = () => {
    if (status === report.status) return

    setIsUpdatingStatus(true)

    try {
      const updatedReport = { ...report, status }
      updateReport(updatedReport)
      onReportUpdated()
      toast({
        title: "Status Updated",
        description: `Report status has been updated to ${status.replace("_", " ")}.`,
      })
    } catch (error) {
      console.error("Error updating report status:", error)
      toast({
        title: "Error",
        description: "There was an error updating the report status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle upvote
  const handleUpvote = () => {
    try {
      upvoteReport(report.id)
      onReportUpdated()
      toast({
        title: "Report Upvoted",
        description: "Thank you for your feedback.",
      })
    } catch (error) {
      console.error("Error upvoting report:", error)
      toast({
        title: "Error",
        description: "There was an error upvoting the report.",
        variant: "destructive",
      })
    }
  }

  // Handle export as JSON
  const handleExportJSON = () => {
    try {
      const jsonData = exportReportAsJSON(report.id)
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `report-${report.id}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Report has been exported as JSON.",
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report.",
        variant: "destructive",
      })
    }
  }

  // Handle export as CSV
  const handleExportCSV = () => {
    try {
      const csvData = exportReportAsCSV(report.id)
      const blob = new Blob([csvData], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `report-${report.id}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Report has been exported as CSV.",
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report.",
        variant: "destructive",
      })
    }
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span>{getCategoryIcon(report.category)}</span>
            <span>{report.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{report.category}</Badge>
          <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
          <Badge className={getStatusColor(report.status)}>{report.status.replace("_", " ")}</Badge>
          {report.reportType && <Badge variant="outline">{report.reportType}</Badge>}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-500 mt-2">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Reported {formatDate(report.createdAt)}</span>
          </div>
          <div className="hidden sm:block">•</div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>By {report.createdBy}</span>
          </div>
          <div className="hidden sm:block">•</div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{report.location.address}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{report.description}</p>
                </div>
              </div>

              {report.incidentDate && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Incident Information</h3>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Date</p>
                          <p>{report.incidentDate}</p>
                        </div>
                      </div>
                      {report.incidentTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-500">Time</p>
                            <p>{report.incidentTime}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {report.actionsTaken && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Actions Taken</h3>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                    <p className="whitespace-pre-wrap">{report.actionsTaken}</p>
                  </div>
                </div>
              )}

              {report.followUpActions && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Follow-up Actions</h3>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                    <p className="whitespace-pre-wrap">{report.followUpActions}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="people" className="space-y-6 mt-4">
            {report.involvedParties && report.involvedParties.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium mb-2">Involved Parties</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  <div className="space-y-4">
                    {report.involvedParties.map((person, index) => (
                      <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-5 w-5 text-slate-400" />
                          <p className="font-medium">{person.name}</p>
                        </div>
                        <div className="ml-7">
                          <p className="text-sm">
                            <span className="text-slate-500">Role:</span> {person.role}
                          </p>
                          {person.contactInfo && (
                            <p className="text-sm">
                              <span className="text-slate-500">Contact:</span> {person.contactInfo}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No involved parties recorded</p>
              </div>
            )}

            {report.witnesses && report.witnesses.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Witnesses</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  <div className="space-y-4">
                    {report.witnesses.map((person, index) => (
                      <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-5 w-5 text-slate-400" />
                          <p className="font-medium">{person.name}</p>
                        </div>
                        <div className="ml-7">
                          <p className="text-sm">
                            <span className="text-slate-500">Role:</span> {person.role}
                          </p>
                          {person.contactInfo && (
                            <p className="text-sm">
                              <span className="text-slate-500">Contact:</span> {person.contactInfo}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="evidence" className="space-y-6 mt-4">
            {(report.evidence && report.evidence.length > 0) || (report.images && report.images.length > 0) ? (
              <>
                {/* Images */}
                {((report.evidence && report.evidence.filter((e) => e.type === "image").length > 0) ||
                  (report.images && report.images.length > 0)) && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Photos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {report.evidence
                        ?.filter((e) => e.type === "image")
                        .map((img, index) => (
                          <div key={index} className="aspect-square rounded-md overflow-hidden border">
                            <img
                              src={img.url || "/placeholder.svg"}
                              alt={img.description}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      {report.images?.map((img, index) => (
                        <div key={`img-${index}`} className="aspect-square rounded-md overflow-hidden border">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Report image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {report.evidence && report.evidence.filter((e) => e.type === "document").length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Documents</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                      <div className="space-y-3">
                        {report.evidence
                          .filter((e) => e.type === "document")
                          .map((doc, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-slate-400" />
                              <div>
                                <p>{doc.description}</p>
                                <p className="text-xs text-slate-500">
                                  Added on {new Date(doc.dateAdded).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other evidence types */}
                {report.evidence &&
                  report.evidence.filter((e) => !["image", "document"].includes(e.type)).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Other Evidence</h3>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                        <div className="space-y-3">
                          {report.evidence
                            .filter((e) => !["image", "document"].includes(e.type))
                            .map((item, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-slate-400" />
                                <div>
                                  <p>{item.description}</p>
                                  <p className="text-xs text-slate-500">
                                    Type: {item.type} • Added on {new Date(item.dateAdded).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No evidence attached to this report</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Comments section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Comments ({report.comments.length})</h3>

          <div className="space-y-4 mb-6">
            {report.comments.length > 0 ? (
              report.comments.map((comment) => (
                <div key={comment.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">{comment.createdBy}</p>
                    <p className="text-sm text-slate-500">{formatDate(comment.createdAt)}</p>
                  </div>
                  <p className="whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-4">No comments yet</p>
            )}
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!comment.trim() || isSubmittingComment}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>

        {/* Actions footer */}
        <div className="mt-8 border-t pt-6 flex flex-wrap gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleUpvote} className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>Upvote ({report.upvotes})</span>
            </Button>

            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                onClick={handleStatusUpdate}
                disabled={status === report.status || isUpdatingStatus}
                className="h-9"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Update
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>JSON</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
