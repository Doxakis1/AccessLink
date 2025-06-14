"use client"

import { useState, useRef } from "react"
import { MapPin, Clock, ThumbsUp, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type Report, type ReportStatus, addComment, updateReport, upvoteReport } from "@/lib/reports"

interface ReportDetailDialogProps {
  report: Report
  isOpen: boolean
  onClose: () => void
  onReportUpdated: () => void
}

export function ReportDetailDialog({ report, isOpen, onClose, onReportUpdated }: ReportDetailDialogProps) {
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<ReportStatus>(report.status)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

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
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmittingComment(false)
      // Focus back on comment input
      setTimeout(() => {
        commentInputRef.current?.focus()
      }, 100)
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
    } catch (error) {
      console.error("Error updating report status:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle upvote
  const handleUpvote = () => {
    upvoteReport(report.id)
    onReportUpdated()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                {getCategoryIcon(report.category)}
              </span>
              <DialogTitle className="text-xl">{report.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(report.status)}`}>{report.status.replace("_", " ")}</Badge>
              <Badge className={`${getSeverityColor(report.severity)}`}>{report.severity}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Location and Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{report.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Reported on {formatDate(report.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{report.description}</p>
          </div>

          {/* Images */}
          {report.images && report.images.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {report.images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden border">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Report image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-medium">Update Status</h3>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={(value) => setStatus(value as ReportStatus)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={status === report.status || isUpdatingStatus}
                className="ml-2"
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Comments ({report.comments.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleUpvote}
                aria-label={`Upvote this report (${report.upvotes} upvotes)`}
              >
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                <span>{report.upvotes}</span>
              </Button>
            </div>

            {/* Comment List */}
            <div className="space-y-4">
              {report.comments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet.</p>
              ) : (
                report.comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">{comment.createdBy}</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <h3 className="font-medium">Add Comment</h3>
              <div className="flex items-end gap-2">
                <Textarea
                  ref={commentInputRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 min-h-[80px]"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || isSubmittingComment}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
