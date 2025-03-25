"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { useSocket } from "@/components/socket-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getOverview, getActivityOverTime, getTopPages } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, BarChart, PieChart } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Clock, MousePointerClick, Eye, ArrowUpRight, ArrowDownRight, BookOpen, BarChart3 } from "lucide-react"
import { ActivityData } from "@/types"

export default function DashboardPage() {
  const { socket, isConnected } = useSocket()
  const [activeStudents, setActiveStudents] = useState(0)
  const [recentEvents, setRecentEvents] = useState(0)

  // Fetch dashboard overview data
  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const response = await getOverview()

      console.log( "OVERVIEW RESPONSE" ,response);

      return response
    },
  })

  // Fetch activity data
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

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return

    // Listen for active sessions updates
    socket.on("analytics-update:active-sessions", (data) => {
      setActiveStudents(data.count)
    })

    // Listen for recent events updates
    socket.on("analytics-update:events-bulk", (data) => {
      setRecentEvents((prev) => prev + data.count)
    })

    // Listen for new events
    socket.on("new-event", () => {
      setRecentEvents((prev) => prev + 1)
    })

    return () => {
      socket.off("analytics-update:active-sessions")
      socket.off("analytics-update:events-bulk")
      socket.off("new-event")
    }
  }, [socket])

  // Format activity data for charts
  const formattedActivityData =
    activityData?.map((item: ActivityData) => ({
      date: format(parseISO(item.date), "MMM dd"),
      sessions: item.sessions,
      pageViews: item.page_views,
      interactions: item.interactions,
    })) || []

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

  const sessionsChange = calculateChange(today.sessions, yesterday.sessions)
  const pageViewsChange = calculateChange(today.pageViews, yesterday.pageViews)
  const interactionsChange = calculateChange(today.interactions, yesterday.interactions)

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
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
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
              <div className="flex items-center text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>Real-time</span>
              </div>
              <span className="ml-2 text-muted-foreground">currently online</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                {isLoadingOverview ? (
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interactions</p>
                {isLoadingOverview ? (
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
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="mb-6">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="pageViews">Page Views</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
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
        </TabsContent>
        <TabsContent value="pageViews" className="mt-4">
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
                    topPages?.map((page: { page_title: any; page_path: string; view_count: any }) => ({
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
        </TabsContent>
        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Activity</CardTitle>
              <CardDescription>Student engagement by faculty</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                data={[
                  { name: "SEST", value: 35 },
                  { name: "FBSS", value: 25 },
                  { name: "FHSS", value: 20 },
                  { name: "FOBE", value: 15 },
                  { name: "Other", value: 5 },
                ]}
                category="value"
                index="name"
                className="h-[350px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent activity and top modules */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest activity on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingOverview ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BarChart3 className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-2">Connect to WebSocket for real-time events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Modules</CardTitle>
            <CardDescription>Most active modules by student engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOverview ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Module {i + 1}</p>
                        <p className="text-xs text-muted-foreground">CODE{i + 100}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{100 - i * 15} students</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

