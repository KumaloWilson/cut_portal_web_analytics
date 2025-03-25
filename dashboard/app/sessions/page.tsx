"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { format, parseISO, formatDistanceToNow } from "date-fns"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getSessions, getActiveSessions } from "@/lib/api"
import { useSocket } from "@/components/socket-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Clock, User, Filter, ArrowUpDown, Activity, Calendar, Timer, Eye } from "lucide-react"
import Link from "next/link"
import type { Session } from "@/types"

export default function SessionsPage() {
  const { socket } = useSocket()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("time")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeSessions, setActiveSessions] = useState<Session[]>([])

  // Fetch sessions data
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await getSessions()
      return response.data
    },
  })

  // Fetch active sessions
  const { data: activeSessionsData, isLoading: isLoadingActive } = useQuery({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      const response = await getActiveSessions()
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Update active sessions when data changes
  useEffect(() => {
    if (activeSessionsData) {
      setActiveSessions(activeSessionsData)
    }
  }, [activeSessionsData])

  // Listen for real-time session updates
  useEffect(() => {
    if (!socket) return

    socket.on("session-update", (updatedSession) => {
      setActiveSessions((prev) => {
        // Check if session already exists in the list
        const exists = prev.some((s) => s.session_id === updatedSession.session_id)

        if (exists) {
          // Update existing session
          return prev.map((s) => (s.session_id === updatedSession.session_id ? updatedSession : s))
        } else {
          // Add new session
          return [updatedSession, ...prev]
        }
      })
    })

    return () => {
      socket.off("session-update")
    }
  }, [socket])

  // Filter and sort sessions
  const filteredSessions = sessions?.filter((session: Session) => {
    const query = searchQuery.toLowerCase()
    return (
      session.session_id.toLowerCase().includes(query) ||
      (session.student_id && session.student_id.toLowerCase().includes(query))
    )
  })

  const sortedSessions = filteredSessions?.sort((a: Session, b: Session) => {
    if (sortBy === "time") {
      const timeA = new Date(a.start_time).getTime()
      const timeB = new Date(b.start_time).getTime()
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA
    } else if (sortBy === "duration") {
      const durationA = a.total_time_spent || 0
      const durationB = b.total_time_spent || 0
      return sortOrder === "asc" ? durationA - durationB : durationB - durationA
    } else if (sortBy === "pages") {
      const pagesA = a.pages_visited || 0
      const pagesB = b.pages_visited || 0
      return sortOrder === "asc" ? pagesA - pagesB : pagesB - pagesA
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

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes < 1) {
      return `${seconds}s`
    }

    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">Track user sessions and activity</p>
        </div>
      </div>

      <Tabs defaultValue="active" className="mb-6">
        <TabsList>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Currently active user sessions</CardDescription>
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
                  <div className="col-span-3">Student</div>
                  <div className="col-span-3">Started</div>
                  <div className="col-span-2 text-center">Duration</div>
                  <div className="col-span-2 text-center">Pages</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {isLoadingActive ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                      <div className="col-span-3 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="col-span-3">
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="col-span-2 text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </div>
                      <div className="col-span-2 text-center">
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </div>
                      <div className="col-span-2 text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </div>
                    </div>
                  ))
                ) : activeSessions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-2">No active sessions at the moment</p>
                  </div>
                ) : (
                  activeSessions.map((session, index) => (
                    <motion.div
                      key={session.session_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                          <User className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{session.student_id || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">Active now</p>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{format(parseISO(session.start_time), "MMM d, h:mm a")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(session.start_time), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="col-span-2 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDuration(session.total_time_spent)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{session.pages_visited || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <Link href={`/sessions/${session.session_id}`}>
                          <Button variant="ghost" size="sm">
                            <Activity className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>
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
                    placeholder="Search sessions..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                  <div className="col-span-3">Student</div>
                  <div className="col-span-3 flex items-center cursor-pointer" onClick={() => toggleSort("time")}>
                    Time
                    {sortBy === "time" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center cursor-pointer" onClick={() => toggleSort("duration")}>
                    Duration
                    {sortBy === "duration" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center cursor-pointer" onClick={() => toggleSort("pages")}>
                    Pages
                    {sortBy === "pages" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {isLoadingSessions
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                        <div className="col-span-3 flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="col-span-3">
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="col-span-2 text-center">
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                        <div className="col-span-2 text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </div>
                        <div className="col-span-2 text-right">
                          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </div>
                      </div>
                    ))
                  : sortedSessions?.map((session: Session, index: number) => (
                      <motion.div
                        key={session.session_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50"
                      >
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{session.student_id || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground">{session.session_id.substring(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{format(parseISO(session.start_time), "MMM d, h:mm a")}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(parseISO(session.start_time), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1">
                              <Timer className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDuration(session.total_time_spent)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{session.pages_visited || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <Link href={`/sessions/${session.session_id}`}>
                            <Button variant="ghost" size="sm">
                              <Activity className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
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

