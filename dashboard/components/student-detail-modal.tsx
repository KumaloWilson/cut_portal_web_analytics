"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, BarChart } from "@/components/ui/chart"
import { getStudentModules, getStudentSessions, getStudentEvents, exportEvents, exportSessions } from "@/lib/api"
import { Calendar, Clock, BookOpen, Activity, Download, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Student, Session, EventType, Module } from "@/types"

interface StudentDetailModalProps {
  student: Student | null
  open: boolean
  onClose: () => void
}

export function StudentDetailModal({ student, open, onClose }: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  // Fetch student modules
  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ["studentModules", student?.student_id],
    queryFn: async () => {
      if (!student?.student_id) return []
      const response = await getStudentModules(student.student_id)
      return response
    },
    enabled: !!student?.student_id && open,
  })

  // Fetch student sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["studentSessions", student?.student_id],
    queryFn: async () => {
      if (!student?.student_id) return []
      const response = await getStudentSessions(student.student_id)
      return response
    },
    enabled: !!student?.student_id && open,
  })

  // Fetch student events
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["studentEvents", student?.student_id],
    queryFn: async () => {
      if (!student?.student_id) return []
      const response = await getStudentEvents(student.student_id, 100, 0)
      return response
    },
    enabled: !!student?.student_id && open,
  })

  // Handle export
  const handleExportSessions = () => {
    if (student?.student_id) {
      exportSessions("excel", student.student_id)
    }
  }

  const handleExportEvents = () => {
    if (student?.student_id) {
      exportEvents("excel", student.student_id)
    }
  }

  // Handle view more
  const handleViewFullProfile = () => {
    if (student?.student_id) {
      router.push(`/students/${student.student_id}`)
      onClose()
    }
  }

  if (!student) return null

  // Format session data for charts
  const sessionData =
    sessions?.map((session: Session) => ({
      date: format(parseISO(session.start_time), "MMM dd"),
      duration: session.total_time_spent ? Math.floor(session.total_time_spent / 60) : 0, // Convert to minutes
      pages: session.pages_visited || 0,
    })) || []

  // Count event types
  const eventTypeCounts: Record<string, number> = {}
  events?.forEach((event: EventType) => {
    const type = event.event_type
    eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1
  })

  const eventTypeData = Object.entries(eventTypeCounts).map(([type, count]) => ({
    type,
    count,
  }))

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Student Profile</DialogTitle>
          <DialogDescription>
            Detailed analytics for {student.first_name} {student.surname}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Student ID</div>
            <div className="font-medium">{student.student_id}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{student.email}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Programme</div>
            <div className="font-medium">
              {student.programme_name} ({student.programme_code})
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Faculty</div>
            <div className="font-medium">{student.faculty_name}</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Enrolled Modules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingModules ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : modules?.length ? (
                    <ul className="space-y-2">
                      {modules.map((module: Module) => (
                        <li key={module.module_id} className="flex items-center p-2 rounded-md bg-muted/50">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{module.module_name}</div>
                            <div className="text-xs text-muted-foreground">{module.module_code}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No modules found</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                        <span>Total Sessions</span>
                      </div>
                      <span className="font-bold">{sessions?.length || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                        <span>Total Time Spent</span>
                      </div>
                      <span className="font-bold">
                        {Math.floor(
                          sessions?.reduce((total, session) => total + (session.total_time_spent || 0), 0) / 60 || 0,
                        )}{" "}
                        minutes
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-muted-foreground mr-2" />
                        <span>Total Events</span>
                      </div>
                      <span className="font-bold">{events?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Session Duration Over Time</CardTitle>
                  <CardDescription>Minutes spent per session</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSessions ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <LineChart
                      data={sessionData}
                      categories={["duration"]}
                      index="date"
                      colors={["blue"]}
                      valueFormatter={(value) => `${value} min`}
                      className="h-[200px]"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Session History</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportSessions}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : sessions?.length ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {sessions.slice(0, 5).map((session: Session) => (
                      <div key={session.session_id} className="p-3 rounded-md border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{format(parseISO(session.start_time), "MMMM d, yyyy")}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(session.start_time), "h:mm a")} -
                              {session.end_time ? format(parseISO(session.end_time), " h:mm a") : " (Active)"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {session.total_time_spent ? Math.floor(session.total_time_spent / 60) : 0} minutes
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.pages_visited || 0} pages visited
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {sessions.length > 5 && (
                      <div className="text-center mt-4">
                        <Button variant="link" onClick={handleViewFullProfile}>
                          View all {sessions.length} sessions
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No session history found</div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session Analytics</CardTitle>
                  <CardDescription>Duration and pages visited per session</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSessions ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <BarChart
                      data={sessionData}
                      categories={["duration", "pages"]}
                      index="date"
                      colors={["blue", "green"]}
                      valueFormatter={(value) => value.toString()}
                      className="h-[300px]"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Event History</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportEvents}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingEvents ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : events?.length ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {events.slice(0, 5).map((event: EventType) => (
                      <div key={event.id} className="p-3 rounded-md border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{event.event_type.replace(/_/g, " ")}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {event.page_title || event.path}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{format(parseISO(event.timestamp), "MMM d, yyyy")}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(event.timestamp), "h:mm:ss a")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {events.length > 5 && (
                      <div className="text-center mt-4">
                        <Button variant="link" onClick={handleViewFullProfile}>
                          View all {events.length} events
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No event history found</div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Event Type Distribution</CardTitle>
                  <CardDescription>Breakdown of event types</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingEvents ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <BarChart
                      data={eventTypeData}
                      categories={["count"]}
                      index="type"
                      colors={["purple"]}
                      valueFormatter={(value) => value.toString()}
                      className="h-[300px]"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleViewFullProfile}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Profile
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
