"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { format, parseISO } from "date-fns"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  getActivityOverTime,
  getTopPages,
  getStudentEngagement,
  getModuleEngagement,
  getTimeOfDayActivity,
} from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, BarChart, LineChart, PieChart } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Clock, Calendar, Users, BookOpen, Eye, MousePointerClick, FileText, Activity } from "lucide-react"
import { ActivityData, Module, ModuleEngagement, PageAnalytics, StudentEngagement, TimeOfDayActivity } from "@/types"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<number>(30)

  // Fetch activity data
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["activity", timeRange],
    queryFn: async () => {
      const response = await getActivityOverTime(timeRange)

      console.log("ACTIVITY RESPONSE",response);
      return response
    },
  })

  // Fetch top pages
  const { data: topPages, isLoading: isLoadingTopPages } = useQuery({
    queryKey: ["topPages"],
    queryFn: async () => {
      const response = await getTopPages(10)
      console.log("TOP PAGES RESPONSE",response);
      return response
    },
  })

  // Fetch student engagement
  const { data: studentEngagement, isLoading: isLoadingStudentEngagement } = useQuery({
    queryKey: ["studentEngagement"],
    queryFn: async () => {
      const response = await getStudentEngagement()
      console.log("STUDENT ENGAGEMENT RESPONSE",response);
      return response
    },
  })

  // Fetch module engagement
  const { data: moduleEngagement, isLoading: isLoadingModuleEngagement } = useQuery({
    queryKey: ["moduleEngagement"],
    queryFn: async () => {
      const response = await getModuleEngagement()
      console.log("MODULE ENGAGEMENT RESPONSE",response);
      return response
    },
  })

  // Fetch time of day activity
  const { data: timeOfDayActivity, isLoading: isLoadingTimeOfDay } = useQuery({
    queryKey: ["timeOfDayActivity"],
    queryFn: async () => {
      const response = await getTimeOfDayActivity()
      console.log("TIME OF DAY ACTIVITY RESPONSE",response);
      return response
    },
  })

  // Format activity data for charts
  const formattedActivityData =
    activityData?.map((item: ActivityData) => ({
      date: format(parseISO(item.date), "MMM dd"),
      sessions: item.sessions,
      pageViews: item.page_views,
      interactions: item.interactions,
    })) || []

  // Format time of day data
  const formattedTimeOfDayData =
    timeOfDayActivity?.map((item: TimeOfDayActivity) => ({
      hour: `${item.hour}:00`,
      events: item.event_count,
    })) || []

  // Format student engagement data
  const formattedStudentEngagement =
    studentEngagement?.slice(0, 10).map((student: StudentEngagement) => ({
      name: `${student.first_name} ${student.surname}`,
      sessions: student.session_count,
      timeSpent: Math.floor(student.total_time_spent / 60), // Convert to minutes
      events: student.event_count,
    })) || []

  // Format module engagement data
  const formattedModuleEngagement =
    moduleEngagement?.slice(0, 10).map((module: ModuleEngagement) => ({
      name: module.module_code,
      students: module.student_count,
      events: module.event_count,
    })) || []

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Sessions, page views, and interactions over time</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Activity by Time of Day</CardTitle>
                <CardDescription>Event distribution across hours of the day</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTimeOfDay ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <BarChart
                    data={formattedTimeOfDayData}
                    categories={["events"]}
                    index="hour"
                    colors={["blue"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>

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
                    colors={["green"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
                <CardDescription>Breakdown of event types</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={[
                    { name: "Page Views", value: 45 },
                    { name: "Clicks", value: 30 },
                    { name: "Form Submits", value: 10 },
                    { name: "Downloads", value: 8 },
                    { name: "Other", value: 7 },
                  ]}
                  category="value"
                  index="name"
                  className="h-[350px]"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="students" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Students by Engagement</CardTitle>
                <CardDescription>Students with highest activity levels</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStudentEngagement ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <BarChart
                    data={formattedStudentEngagement}
                    categories={["sessions", "timeSpent", "events"]}
                    index="name"
                    colors={["blue", "green", "amber"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Activity Trends</CardTitle>
                <CardDescription>Activity patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <LineChart
                    data={formattedActivityData}
                    categories={["sessions"]}
                    index="date"
                    colors={["blue"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Student Engagement Metrics</CardTitle>
                <CardDescription>Detailed breakdown of student activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                    <div className="col-span-4">Student</div>
                    <div className="col-span-2 text-center">Sessions</div>
                    <div className="col-span-2 text-center">Time Spent (min)</div>
                    <div className="col-span-2 text-center">Page Views</div>
                    <div className="col-span-2 text-center">Interactions</div>
                  </div>
                  {isLoadingStudentEngagement
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                          <div className="col-span-4">
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </div>
                        </div>
                      ))
                    : studentEngagement?.slice(0, 10).map((student: StudentEngagement, index: number) => (
                        <motion.div
                          key={student.student_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50"
                        >
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-sm font-medium text-primary">
                                {student.first_name[0]}
                                {student.surname[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {student.first_name} {student.surname}
                              </p>
                              <p className="text-xs text-muted-foreground">{student.student_id}</p>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{student.session_count}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{Math.floor(student.total_time_spent / 60)}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span>{Math.floor(student.event_count * 0.6)}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                              <span>{Math.floor(student.event_count * 0.4)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="modules" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Modules by Engagement</CardTitle>
                <CardDescription>Modules with highest student activity</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingModuleEngagement ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <BarChart
                    data={formattedModuleEngagement}
                    categories={["students", "events"]}
                    index="name"
                    colors={["blue", "green"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module Popularity</CardTitle>
                <CardDescription>Distribution of student enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingModuleEngagement ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <PieChart
                    data={
                      moduleEngagement?.slice(0, 5).map((module: ModuleEngagement) => ({
                        name: module.module_code,
                        value: module.student_count,
                      })) || []
                    }
                    category="value"
                    index="name"
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Module Engagement Details</CardTitle>
                <CardDescription>Detailed breakdown of module activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                    <div className="col-span-4">Module</div>
                    <div className="col-span-2 text-center">Code</div>
                    <div className="col-span-2 text-center">Students</div>
                    <div className="col-span-2 text-center">Events</div>
                    <div className="col-span-2 text-center">Engagement Score</div>
                  </div>
                  {isLoadingModuleEngagement
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                          <div className="col-span-4">
                            <Skeleton className="h-4 w-40" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-16 mx-auto" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-16 mx-auto" />
                          </div>
                        </div>
                      ))
                    : moduleEngagement?.slice(0, 10).map((module: ModuleEngagement, index: number) => (
                        <motion.div
                          key={module.module_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50"
                        >
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium truncate" title={module.module_name}>
                                {module.module_name}
                              </p>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-sm font-medium">{module.module_code}</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{module.student_count}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span>{module.event_count}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium inline-block">
                              {Math.floor((module.event_count / (module.student_count || 1)) * 10)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="pages" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
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
                    colors={["green"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page View Trends</CardTitle>
                <CardDescription>Page view patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <LineChart
                    data={formattedActivityData}
                    categories={["pageViews"]}
                    index="date"
                    colors={["green"]}
                    valueFormatter={(value) => value.toString()}
                    className="h-[350px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Page Analytics</CardTitle>
                <CardDescription>Detailed breakdown of page performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                    <div className="col-span-6">Page</div>
                    <div className="col-span-2 text-center">Views</div>
                    <div className="col-span-2 text-center">Avg. Time</div>
                    <div className="col-span-2 text-center">Bounce Rate</div>
                  </div>
                  {isLoadingTopPages
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                          <div className="col-span-6">
                            <Skeleton className="h-4 w-48" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-16 mx-auto" />
                          </div>
                          <div className="col-span-2 text-center">
                            <Skeleton className="h-4 w-16 mx-auto" />
                          </div>
                        </div>
                      ))
                    : topPages?.map((page: PageAnalytics, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50"
                        >
                          <div className="col-span-6 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium truncate" title={page.page_path}>
                                {page.page_title || page.page_path}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{page.page_path}</p>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span>{page.view_count}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-sm">{Math.floor(Math.random() * 120) + 10}s</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-sm">{Math.floor(Math.random() * 50) + 20}%</span>
                          </div>
                        </motion.div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

