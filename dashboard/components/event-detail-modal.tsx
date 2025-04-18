"use client"

import { format, parseISO } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { exportToCSV } from "@/lib/export"
import { Clock, Globe, FileText, Download } from "lucide-react"
import type { EventType } from "@/types"

interface EventDetailModalProps {
  event: EventType | null
  open: boolean
  onClose: () => void
}

export function EventDetailModal({ event, open, onClose }: EventDetailModalProps) {
  if (!event) return null

  // Handle export
  const handleExport = () => {
    if (event) {
      exportToCSV([event], "events", `event_${event.id}`)
    }
  }

  // Format event details for display
  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "click":
        return "🖱️"
      case "page_view":
        return "👁️"
      case "login":
      case "login_detected":
        return "🔑"
      case "logout":
        return "🚪"
      case "file_download":
        return "📥"
      case "form_submit":
        return "📝"
      default:
        return "📊"
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <span className="mr-2">{getEventIcon(event.event_type)}</span>
            {event.event_type.replace(/_/g, " ")}
          </DialogTitle>
          <DialogDescription>Event details and information</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Date</div>
            <div className="font-medium">{format(parseISO(event.timestamp), "MMMM d, yyyy")}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="font-medium">{format(parseISO(event.timestamp), "h:mm:ss a")}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Student ID</div>
            <div className="font-medium">{event.student_id || "Anonymous"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Session ID</div>
            <div className="font-medium truncate">{event.session_id}</div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">URL</div>
                  <div className="font-medium break-all">{event.url}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Page Title</div>
                  <div className="font-medium">{event.page_title || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Path</div>
                  <div className="font-medium break-all">{event.path}</div>
                </div>
              </div>

              {event.details && Object.keys(event.details).length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Additional Details</div>
                  <div className="bg-muted p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(event.details, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
