"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { format, parseISO, formatDistanceToNow } from "date-fns"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getEvents, getRecentEvents } from "@/lib/api"
import { useSocket } from "@/components/socket-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Activity,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Clock,
  User,
  MousePointerClick,
  Eye,
  FileText,
  Download,
  LogIn,
  LogOut,
  AlertTriangle,
} from "lucide-react"
import type { Event } from "@/types"

export default function EventsPage() {
  const { socket } = useSocket()
  const [searchQuery, setSearchQuery] = useState("")
  const [eventType, setEventType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("time")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [recentEvents, setRecentEvents] = useState<Event[]>([])

  // Fetch events data
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await getEvents(100, 0)
      return response.data
    },
  })

  // Fetch recent events
  const { data: recentEventsData, isLoading: isLoadingRecent } = useQuery({
    queryKey: ["recentEvents"],
    queryFn: async () => {
      const response = await getRecentEvents(30, 50)
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Update recent events when data changes
  useEffect(() => {
    if (recentEventsData) {
      setRecentEvents(recentEventsData)
    }
  }, [recentEventsData])

  // Listen for real-time event updates
  useEffect(() => {
    if (!socket) return

    socket.on("new-event", (newEvent) => {
      setRecentEvents((prev) => {
        // Add new event to the beginning of the array
        const updated = [newEvent, ...prev]
        // Keep only the latest 50 events
        return updated.slice(0, 50)
      })
    })

    return () => {
      socket.off("new-event")
    }
  }, [socket])

  // Filter and sort events
  const filteredEvents = events?.filter((event: Event) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      event.event_type.toLowerCase().includes(query) ||
      event.path.toLowerCase().includes(query) ||
      (event.page_title && event.page_title.toLowerCase().includes(query)) ||
      (event.student_id && event.student_id.toLowerCase().includes(query))

    // Filter by event type if not "all"
    if (eventType !== "all") {
      return matchesSearch && event.event_type === eventType
    }

    return matchesSearch
  })

  const sortedEvents = filteredEvents?.sort((a: Event, b: Event) => {
    if (sortBy === "time") {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA
    } else if (sortBy === "type") {
      return sortOrder === "asc" ? a.event_type.localeCompare(b.event_type) : b.event_type.localeCompare(a.event_type)
    } else if (sortBy === "path") {
      return sortOrder === "asc" ? a.path.localeCompare(b.path) : b.path.localeCompare(a.path)
    }
    return 0
  })

  // Toggle sort order
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  // Get icon for event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "page_view":
        return <Eye className="h-4 w-4" />
      case "click":
        return <MousePointerClick className="h-4 w-4" />
      case "form_submit":
        return <FileText className="h-4 w-4" />
      case "file_download":
        return <Download className="h-4 w-4" />
      case "login_detected":
        return <LogIn className="h-4 w-4" />
      case "logout":
        return <LogOut className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Track and analyze user interactions</p>
        </div>
      </div>

      <Tabs defaultValue="recent" className="mb-6">
        <TabsList>
          <TabsTrigger value="recent">Recent Events</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>Latest user interactions in real-time</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span>Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                  <div className="col-span-2">Type</div>
                  <div className="col-span-3">Path</div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-3">Time</div>
                  <div className="col-span-1 text-right">Details</div>
                </div>
                {isLoadingRecent ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                      <div className="col-span-2">
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="col-span-3">
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="col-span-3">
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="col-span-3">
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="col-span-1 text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </div>
                    </div>
                  ))
                ) : recentEvents.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <Activity className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">No recent events</p>
                  </div>
                ) : (
                  recentEvents.map((event, index) => (
                    <motion.div
                      key={`${event.id}-${index}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50"
                    >
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            {getEventIcon(event.event_type)}
                          </div>
                          <span className="text-sm font-medium">{event.event_type.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                      <div className="col-span-3 truncate text-sm" title={event.path}>
                        {event.path}
                      </div>
                      <div className="col-span-3 text-sm">
                        {event.student_id ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{event.student_id}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Anonymous</span>
                        )}
                      </div>
                      <div className="col-span-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDistanceToNow(parseISO(event.timestamp), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search events..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="page_view">Page View</option>
                    <option value="click">Click</option>
                    <option value="form_submit">Form Submit</option>
                    <option value="file_download">Download</option>
                    <option value="login_detected">Login</option>
                    <option value="logout">Logout</option>
                    <option value="error">Error</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                  <div className="col-span-2 flex items-center cursor-pointer" onClick={() => toggleSort("type")}>
                    Type
                    {sortBy === "type" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-3 flex items-center cursor-pointer" onClick={() => toggleSort("path")}>
                    Path
                    {sortBy === "path" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-3 flex items-center cursor-pointer" onClick={() => toggleSort("time")}>
                    Time
                    {sortBy === "time" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-1 text-right">Details</div>
                </div>
                {isLoadingEvents
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                        <div className="col-span-2">
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="col-span-3">
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="col-span-3">
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="col-span-3">
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="col-span-1 text-right">
                          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </div>
                      </div>
                    ))
                  : sortedEvents?.map((event: Event, index: number) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50"
                      >
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              {getEventIcon(event.event_type)}
                            </div>
                            <span className="text-sm font-medium">{event.event_type.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                        <div className="col-span-3 truncate text-sm" title={event.path}>
                          {event.path}
                        </div>
                        <div className="col-span-3 text-sm">
                          {event.student_id ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{event.student_id}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Anonymous</span>
                          )}
                        </div>
                        <div className="col-span-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{format(parseISO(event.timestamp), "MMM d, h:mm:ss a")}</span>
                          </div>
                        </div>
                        <div className="col-span-1 text-right">
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

