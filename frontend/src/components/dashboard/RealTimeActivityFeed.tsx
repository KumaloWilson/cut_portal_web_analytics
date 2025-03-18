"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

interface RealtimeActivityFeedProps {
  socket: any
}

export default function RealtimeActivityFeed({ socket }: RealtimeActivityFeedProps) {
  const [events, setEvents] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!socket) return

    // Set connection status
    setIsConnected(socket.connected)

    // Listen for connection events
    socket.on("connect", () => {
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    // Listen for new events
    socket.on("newEvent", (event: any) => {
      setEvents((prev) => [event, ...prev].slice(0, 50)) // Keep only the latest 50 events
    })

    // Join analytics room
    socket.emit("joinAnalytics")

    // Cleanup
    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("newEvent")
    }
  }, [socket])

  // Format event type for display
  const formatEventType = (eventType: string) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get badge variant based on event type
  const getBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case "page_view":
        return "default"
      case "button_click":
        return "secondary"
      case "resource_access":
        return "destructive"
      case "login":
        return "outline"
      case "module_list_view":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Real-time Activity</CardTitle>
            <CardDescription>Live student interactions</CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {events.length === 0 ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-5 w-[80px]" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {event.userId?.charAt(0) || event.studentId?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.userId || event.studentId || "Anonymous"}</span>
                      <Badge variant={getBadgeVariant(event.eventType)}>{formatEventType(event.eventType)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.details?.title || event.path || event.url}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

