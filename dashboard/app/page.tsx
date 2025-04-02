"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { useSocket } from "@/components/socket-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  getOverview,
  getActivityOverTime,
  getTopPages,
  getStudentEngagement,
  getModuleEngagement,
  getTimeOfDayActivity,
  getRecentEvents,
} from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, BarChart, PieChart, LineChart } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Clock,
  MousePointerClick,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  TrendingUp,
} from "lucide-react"
import type { ActivityData, EventType } from "@/types"
import { EventsTimeline } from "@/components/events-timeline"
import { ModuleEngagementList } from "@/components/module-engagement"
import { VisitorsOverview } from "@/components/visitors-overview"

export default function DashboardPage() {
  const { socket, isConnected } = useSocket()
  const [activeStudents, setActiveStudents] = useState(0)
  const [recentEvents, setRecentEvents] = useState<EventType[]>([])
  const [dailyVisitors, setDailyVisitors] = useState(0)
  const [visitorTrend, setVisitorTrend] = useState(0)

  // Fetch dashboard overview data
  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const response = await getOverview()
      return response
    },
  })

  // Fetch activity data for the past 30 days
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const response = await getActivityOverTime(30)
      return response
    },
  })

  // Fetch top pages
  const { data: topPages, isLoading: isLoadingTopPages } = useQuery({
    queryKey: ["topPages"],
    queryFn: async () => {
      const response = await getTopPages(10)
      return response
    },
  })

  // Fetch student engagement data
  const { data: studentEngagement, isLoading: isLoadingStudentEngagement } = useQuery({
    queryKey: ["studentEngagement"],
    queryFn: async () => {
      const response = await getStudentEngagement()
      return response
    },
  })

  // Fetch module engagement data
  const { data: moduleEngagement, isLoading: isLoadingModuleEngagement } = useQuery({
    queryKey: ["moduleEngagement"],
    queryFn: async () => {
      const response = await getModuleEngagement()
      return response
    },
  })

  // Fetch time of day activity
  const { data: timeOfDayActivity, isLoading: isLoadingTimeOfDay } = useQuery({
    queryKey: ["timeOfDayActivity"],
    queryFn: async () => {
      const response = await getTimeOfDayActivity()
      return response
    },
  })

  // Fetch recent events
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["recentEvents"],
    queryFn: async () => {
      const response = await getRecentEvents(30, 10) // Last 30 minutes, 10 events
      return response
    },
  })

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return

    // Listen for active sessions updates
    socket.on("analytics-update:active-sessions", (data) => {
      setActiveStudents(data.count)
    })

    // Listen for daily visitors updates
    socket.on("analytics-update:daily-visitors", (data) => {
      setDailyVisitors(data.count)
      setVisitorTrend(data.trend)
    })

    // Listen for new events
    socket.on("new-event", (eventData) => {
      setRecentEvents((prev) => [eventData, ...prev].slice(0, 10))
    })

    return () => {
      socket.off("analytics-update:active-sessions")
      socket.off("analytics-update:daily-visitors")
      socket.off("new-event")
    }
  }, [socket])

  // Initialize recent events from API data
  useEffect(() => {
    if (events && events.length > 0) {
      setRecentEvents(events)
    }
  }, [events])

  // Calculate daily visitors from activity data
  useEffect(() => {
    if (activityData && activityData.length > 0) {
      const today = activityData[activityData.length - 1]
      if (today) {
        setDailyVisitors(today.sessions)

        const yesterday = activityData[activityData.length - 2]
        if (yesterday) {
          const trend = ((today.sessions - yesterday.sessions) / yesterday.sessions) * 100
          setVisitorTrend(trend)
        }
      }
    }
  }, [activityData])

  // Format activity data for charts
  const formattedActivityData =
    activityData?.map((item: ActivityData) => ({
      date: format(parseISO(item.date), "MMM dd"),
      sessions: item.sessions,
      pageViews: item.page_views,
      interactions: item.interactions,
    })) || []

  // Format time of day data for charts
  const formattedTimeOfDayData =
    timeOfDayActivity?.map((item) => ({
      hour: `${item.hour}:00`,
      events: item.event_count,
    })) || []

  // Faculty distribution data from student engagement
  const calculateFacultyDistribution = () => {
    if (!studentEngagement) return []

    const faculties = {} as Record<string, number>

    studentEngagement.forEach((student) => {
      const faculty = student.faculty_name || "Other"
      if (faculties[faculty]) {
        faculties[faculty]++
      } else {
        faculties[faculty] = 1
      }
    })

    return Object.entries(faculties).map(([name, value]) => ({ name, value }))
  }

  // Calculate percentage changes for stats
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  // Get data for the last day vs previous day
  const today = formattedActivityData[formattedActivityData.length - 1] || {
    sessions: 0,
    pageViews: 0,
    interactions: 0,
  }
  const yesterday = formattedActivityData[formattedActivityData.length - 2] || {
    sessions: 0,
    pageViews: 0,
    interactions: 0,
  }

  // const sessionsChange = calculateChange(today.sessions, yesterday.sessions)
  const pageViewsChange = calculateChange(today.pageViews, yesterday.pageViews)
  const interactionsChange = calculateChange(today.interactions, yesterday.interactions)

  // Animations
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  }

  return (
    <DashboardLayout>
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Real-time analytics for CUT eLearning platform</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>Live</span>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            <CalendarDays className="inline mr-1 h-4 w-4" />
            {format(new Date(), "MMMM d, yyyy")}
          </div>
        </div>
      </motion.div>

      {/* Daily visitors overview */}
      <motion.div className="mb-6" {...fadeIn} transition={{ duration: 0.5, delay: 0.1 }}>
        <VisitorsOverview
          dailyVisitors={dailyVisitors}
          visitorTrend={visitorTrend}
          isLoading={isLoadingActivity}
          activityData={formattedActivityData.slice(-14)} // Last 14 days
        />
      </motion.div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Students</p>
                  {isLoadingOverview ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold">{overview?.total_students || 0}</h3>
                  )}
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center text-green-500">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  <span>12%</span>
                </div>
                <span className="ml-2 text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <h3 className="text-2xl font-bold">{activeStudents || 0}</h3>
                </div>
                <div className="rounded-full bg-blue-500/10 p-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center text-blue-500">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span>Real-time</span>
                </div>
                <span className="ml-2 text-muted-foreground">currently online</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                  {isLoadingActivity ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold">{today.pageViews || 0}</h3>
                  )}
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <Eye className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className={`flex items-center ${pageViewsChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {pageViewsChange >= 0 ? (
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                  )}
                  <span>{Math.abs(pageViewsChange).toFixed(1)}%</span>
                </div>
                <span className="ml-2 text-muted-foreground">vs yesterday</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interactions</p>
                  {isLoadingActivity ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold">{today.interactions || 0}</h3>
                  )}
                </div>
                <div className="rounded-full bg-amber-500/10 p-3">
                  <MousePointerClick className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className={`flex items-center ${interactionsChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {interactionsChange >= 0 ? (
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                  )}
                  <span>{Math.abs(interactionsChange).toFixed(1)}%</span>
                </div>
                <span className="ml-2 text-muted-foreground">vs yesterday</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="mb-6">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="pageViews">Page Views</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Traffic</TabsTrigger>
          <TabsTrigger value="students">Student Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <motion.div {...fadeIn} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Sessions, page views, and interactions over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <AreaChart
                    data={formattedActivityData}
                    categories={["sessions", "pageViews", "interactions"]}
                    index="date"
                    colors={["blue", "green", "amber"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="pageViews" className="mt-4">
          <motion.div {...fadeIn} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTopPages ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <BarChart
                    data={
                      topPages?.map((page) => ({
                        page: page.page_title || page.page_path.split("/").pop() || page.page_path,
                        views: page.view_count,
                      })) || []
                    }
                    categories={["views"]}
                    index="page"
                    colors={["blue"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="hourly" className="mt-4">
          <motion.div {...fadeIn} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity Distribution</CardTitle>
                <CardDescription>Event frequency by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTimeOfDay ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <LineChart
                    data={formattedTimeOfDayData}
                    categories={["events"]}
                    index="hour"
                    colors={["purple"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <motion.div {...fadeIn} transition={{ duration: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
                <CardDescription>Student engagement by faculty</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStudentEngagement ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <PieChart data={calculateFacultyDistribution()} category="value" index="name" className="h-[350px]" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Recent activity and top modules */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div {...fadeIn} transition={{ duration: 0.7 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest activity on the platform</CardDescription>
              </div>
              <Badge variant="outline" className="ml-auto">
                Live
              </Badge>
            </CardHeader>
            <CardContent>
              <EventsTimeline events={recentEvents} isLoading={isLoadingEvents} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn} transition={{ duration: 0.7, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Top Modules</CardTitle>
              <CardDescription>Most active modules by student engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ModuleEngagementList modules={moduleEngagement || []} isLoading={isLoadingModuleEngagement} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

