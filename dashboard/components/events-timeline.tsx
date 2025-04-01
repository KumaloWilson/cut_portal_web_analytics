"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { EventType } from "@/types"
import {
  MousePointerClick,
  Eye,
  FilePlus,
  FileEdit,
  LogIn,
  LogOut,
  Video,
  BookOpen,
  FileText,
  MessageSquare,
} from "lucide-react"

interface EventsTimelineProps {
  events: EventType[]
  isLoading: boolean
}

export function EventsTimeline({ events, isLoading }: EventsTimelineProps) {
  const [displayEvents, setDisplayEvents] = useState<EventType[]>([])

  useEffect(() => {
    setDisplayEvents(events)
  }, [events])

  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "click":
        return <MousePointerClick className="h-4 w-4" />
      case "pageview":
        return <Eye className="h-4 w-4" />
      case "login":
        return <LogIn className="h-4 w-4" />
      case "logout":
        return <LogOut className="h-4 w-4" />
      case "file_upload":
        return <FilePlus className="h-4 w-4" />
      case "file_edit":
        return <FileEdit className="h-4 w-4" />
      case "video_play":
        return <Video className="h-4 w-4" />
      case "module_view":
        return <BookOpen className="h-4 w-4" />
      case "document_view":
        return <FileText className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const getEventColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "click":
        return "bg-blue-500"
      case "pageview":
        return "bg-green-500"
      case "login":
        return "bg-purple-500"
      case "logout":
        return "bg-orange-500"
      case "file_upload":
      case "file_edit":
        return "bg-amber-500"
      case "video_play":
        return "bg-red-500"
      case "module_view":
        return "bg-cyan-500"
      case "document_view":
        return "bg-indigo-500"
      case "comment":
        return "bg-pink-500"
      default:
        return "bg-slate-500"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!displayEvents || displayEvents.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Eye className="mx-auto h-12 w-12 opacity-20" />
        <p className="mt-2">No recent events to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      <AnimatePresence initial={false}>
        {displayEvents.map((event, index) => (
          <motion.div
            key={event.id || index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start space-x-4"
          >
            <Avatar className="h-10 w-10">
              <div
                className={`absolute inset-0 flex items-center justify-center text-white ${getEventColor(event.event_type)}`}
              >
                {getEventIcon(event.event_type)}
              </div>
              <AvatarFallback>{getInitials(event.student_id ?? "")}</AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <p className="text-sm font-medium">
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} event
                {event.student_id && <span className="text-muted-foreground"> by {event.student_id}</span>}
              </p>

              <p className="text-sm text-muted-foreground line-clamp-1">
                {event.page_title || event.path.split("/").pop() || event.path}
              </p>

              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

