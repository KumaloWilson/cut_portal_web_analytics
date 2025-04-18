"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, FileDown } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,  
  Tooltip,
  Legend,
  PieChart,

  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fetchAnalytics, fetchStudentEngagement, fetchModuleEngagement, fetchEventDistribution } from "@/lib/api"
import { exportToCSV } from "@/lib/export"
import { anonymizeData } from "@/lib/anonymize"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  })

  const { data: studentEngagement, isLoading: isLoadingStudentEngagement } = useQuery({
    queryKey: ["studentEngagement"],
    queryFn: fetchStudentEngagement,
  })

  const { data: moduleEngagement, isLoading: isLoadingModuleEngagement } = useQuery({
    queryKey: ["moduleEngagement"],
    queryFn: fetchModuleEngagement,
  })

  const { data: eventDistribution, isLoading: isLoadingEventDistribution } = useQuery({
    queryKey: ["eventDistribution"],
    queryFn: fetchEventDistribution,
  })

  const handleExportData = (data, filename) => {
    const anonymizedData = anonymizeData(data)
    exportToCSV(anonymizedData, filename)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => handleExportData(analyticsData, "analytics-export")}
          disabled={isLoadingAnalytics}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Engagement</TabsTrigger>
          <TabsTrigger value="modules">Module Performance</TabsTrigger>
          <TabsTrigger value="events">Event Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>Number of active students per day</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ChartContainer
                    config={{
                      users: {
                        label: "Active Users",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData?.dailyActiveUsers || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="var(--color-users)"
                          name="Active Users"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Duration</CardTitle>
                <CardDescription>Average session duration in minutes</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ChartContainer
                    config={{
                      duration: {
                        label: "Duration (min)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData?.sessionDuration || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="avgDuration" fill="var(--color-duration)" name="Duration (min)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Distribution</CardTitle>
              <CardDescription>Distribution of event types</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingEventDistribution ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(eventDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} events`, props.payload.type]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement Over Time</CardTitle>
              <CardDescription>Tracking student activity levels</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => handleExportData(studentEngagement, "student-engagement-export")}
                disabled={isLoadingStudentEngagement}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="h-96">
              {isLoadingStudentEngagement ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
              ) : (
                <ChartContainer
                  config={{
                    engagement: {
                      label: "Engagement Score",
                      color: "hsl(var(--chart-3))",
                    },
                    events: {
                      label: "Event Count",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studentEngagement || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="engagementScore"
                        stroke="var(--color-engagement)"
                        name="Engagement Score"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="eventCount"
                        stroke="var(--color-events)"
                        name="Event Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Spent by Student</CardTitle>
                <CardDescription>Total time spent on platform (hours)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingStudentEngagement ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ChartContainer
                    config={{
                      time: {
                        label: "Hours",
                        color: "hsl(var(--chart-5))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentEngagement?.timeSpentByStudent || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="studentId" tick={{ fontSize: 12 }} width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="hours" fill="var(--color-time)" name="Hours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
                <CardDescription>Module completion rate by student (%)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingStudentEngagement ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ChartContainer
                    config={{
                      completion: {
                        label: "Completion Rate",
                        color: "hsl(var(--chart-6))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentEngagement?.completionRate || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="studentId" />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="rate" fill="var(--color-completion)" name="Completion Rate" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Engagement</CardTitle>
              <CardDescription>Engagement metrics by module</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => handleExportData(moduleEngagement, "module-engagement-export")}
                disabled={isLoadingModuleEngagement}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="h-96">
              {isLoadingModuleEngagement ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
              ) : (
                <ChartContainer
                  config={{
                    views: {
                      label: "Views",
                      color: "hsl(var(--chart-1))",
                    },
                    timeSpent: {
                      label: "Avg. Time (min)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moduleEngagement || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="moduleName" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="views" fill="var(--color-views)" name="Views" />
                      <Bar
                        yAxisId="right"
                        dataKey="avgTimeSpent"
                        fill="var(--color-timeSpent)"
                        name="Avg. Time (min)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate by Module</CardTitle>
                <CardDescription>Percentage of students who completed each module</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingModuleEngagement ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ChartContainer
                    config={{
                      completion: {
                        label: "Completion Rate",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={moduleEngagement?.completionRate || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="moduleName" width={150} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="rate" fill="var(--color-completion)" name="Completion Rate" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Difficulty Rating</CardTitle>
                <CardDescription>Average difficulty rating by module (1-5)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingModuleEngagement ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ChartContainer
                    config={{
                      difficulty: {
                        label: "Difficulty",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={moduleEngagement?.difficultyRating || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="moduleName" />
                        <YAxis domain={[0, 5]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="rating" fill="var(--color-difficulty)" name="Difficulty" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Distribution Over Time</CardTitle>
              <CardDescription>Number of events by type over time</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => handleExportData(eventDistribution, "event-distribution-export")}
                disabled={isLoadingEventDistribution}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="h-96">
              {isLoadingEventDistribution ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
              ) : (
                <ChartContainer
                  config={{
                    pageView: {
                      label: "Page Views",
                      color: "hsl(var(--chart-1))",
                    },
                    click: {
                      label: "Clicks",
                      color: "hsl(var(--chart-2))",
                    },
                    scroll: {
                      label: "Scrolls",
                      color: "hsl(var(--chart-3))",
                    },
                    quiz: {
                      label: "Quiz Attempts",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={eventDistribution?.byTime || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="pageView" stroke="var(--color-pageView)" name="Page Views" />
                      <Line type="monotone" dataKey="click" stroke="var(--color-click)" name="Clicks" />
                      <Line type="monotone" dataKey="scroll" stroke="var(--color-scroll)" name="Scrolls" />
                      <Line type="monotone" dataKey="quiz" stroke="var(--color-quiz)" name="Quiz Attempts" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Frequency by Hour</CardTitle>
                <CardDescription>Distribution of events throughout the day</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingEventDistribution ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ChartContainer
                    config={{
                      count: {
                        label: "Event Count",
                        color: "hsl(var(--chart-5))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventDistribution?.byHour || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="count" fill="var(--color-count)" name="Event Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Duration</CardTitle>
                <CardDescription>Average duration of events by type (seconds)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingEventDistribution ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ChartContainer
                    config={{
                      duration: {
                        label: "Duration (sec)",
                        color: "hsl(var(--chart-6))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventDistribution?.duration || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="avgDuration" fill="var(--color-duration)" name="Duration (sec)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
