"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getStudent, getStudentModules, getStudentSessions, getStudentEvents } from "@/lib/api"
import { exportToCSV } from "@/lib/export"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, LineChart } from "@/components/ui/chart"
import { EventDetailModal } from "@/components/event-detail-modal"
import {
  ArrowLeft,
  User,
  BookOpen,
  Clock,
  Calendar,
  Activity,
  Download,
  ChevronRight,
  Eye,
  MousePointerClick,
} from "lucide-react"
import type { Module, Session, EventType } from "@/types"

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  // Fetch student data
  const { data: student, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const response = await getStudent(studentId)
      return response
    },
  })

  // Fetch student modules
  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ["studentModules", studentId],
    queryFn: async () => {
      const response = await getStudentModules(studentId)
      return response
    },
  })

  // Fetch student sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["studentSessions", studentId],
    queryFn: async () => {
      const response = await getStudentSessions(studentId)
      return response
    },
  })

  // Fetch student events
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["studentEvents", studentId],
    queryFn: async () => {
      const response = await getStudentEvents(studentId, 100, 0)
      return response
    },
  })

  // Handle export
  const handleExportSessions = () => {
    if (sessions) {
      exportToCSV(sessions, "sessions", `student_${studentId}_sessions`)
    }
  }

  const handleExportEvents = () => {
    if (events) {
      exportToCSV(events, "events", `student_${studentId}_events`)
    }
  }

  // Handle event click
  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

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
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isLoadingStudent ? (
              <Skeleton className="h-9 w-48 inline-block" />
            ) : (
              `${student?.first_name} ${student?.surname}`
            )}
          </h1>
          <p className="text-muted-foreground">
            {isLoadingStudent ? <Skeleton className="h-5 w-32 inline-block" /> : `Student ID: ${student?.student_id}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <User className="mr-2 h-5 w-5 text-muted-foreground" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStudent ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{student?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Programme:</span>
                  <span className="font-medium">{student?.programme_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Faculty:</span>
                  <span className="font-medium">{student?.faculty_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium">{student?.level}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
              Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSessions ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sessions:</span>
                  <span className="font-medium">{sessions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Time:</span>
                  <span className="font-medium">
                    {Math.floor(
                      sessions?.reduce((total, session) => total + (session.total_time_spent || 0), 0) / 60 || 0,
                    )}{" "}
                    minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pages Visited:</span>
                  <span className="font-medium">
                    {sessions?.reduce((total, session) => total + (session.pages_visited || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Active:</span>
                  <span className="font-medium">
                    {sessions && sessions.length > 0 ? format(parseISO(sessions[0].start_time), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-muted-foreground" />
              Event Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Events:</span>
                  <span className="font-medium">{events?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Page Views:</span>
                  <span className="font-medium">
                    {events?.filter((event) => event.event_type === "page_view").length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interactions:</span>
                  <span className="font-medium">
                    {events?.filter((event) => event.event_type !== "page_view").length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Event:</span>
                  <span className="font-medium">
                    {events && events.length > 0 ? format(parseISO(events[0].timestamp), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="mb-6">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Modules</CardTitle>
              <CardDescription>Modules the student is enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingModules ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : modules?.length ? (
                <div className="space-y-4">
                  {modules.map((module: Module) => (
                    <div key={module.module_id} className="flex items-center p-4 rounded-md border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{module.module_name}</div>
                        <div className="text-sm text-muted-foreground">{module.module_code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-2">No modules found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Record of student sessions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportSessions}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : sessions?.length ? (
                <div className="space-y-4">
                  {sessions.map((session: Session) => (
                    <div key={session.session_id} className="flex justify-between items-center p-4 rounded-md border">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium">{format(parseISO(session.start_time), "MMMM d, yyyy")}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(parseISO(session.start_time), "h:mm a")} -
                            {session.end_time ? format(parseISO(session.end_time), " h:mm a") : " (Active)"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {session.total_time_spent ? Math.floor(session.total_time_spent / 60) : 0} minutes
                        </div>
                        <div className="text-sm text-muted-foreground">{session.pages_visited || 0} pages visited</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-2">No session history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Event History</CardTitle>
                <CardDescription>Record of student interactions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportEvents}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : events?.length ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {events.map((event: EventType) => (
                    <div
                      key={event.id}
                      className="flex justify-between items-center p-4 rounded-md border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          {event.event_type === "page_view" ? (
                            <Eye className="h-5 w-5 text-primary" />
                          ) : (
                            <MousePointerClick className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{event.event_type.replace(/_/g, " ")}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {event.page_title || event.path}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <div className="font-medium">{format(parseISO(event.timestamp), "MMM d, yyyy")}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(parseISO(event.timestamp), "h:mm:ss a")}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-2">No event history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Duration</CardTitle>
                <CardDescription>Minutes spent per session</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <LineChart
                    data={sessionData}
                    categories={["duration"]}
                    index="date"
                    colors={["blue"]}
                    valueFormatter={(value) => `${value} min`}
                    className="h-[300px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pages Visited</CardTitle>
                <CardDescription>Pages visited per session</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <BarChart
                    data={sessionData}
                    categories={["pages"]}
                    index="date"
                    colors={["green"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[300px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
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

      <EventDetailModal event={selectedEvent} open={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
    </DashboardLayout>
  )
}
