"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { useSocket } from "../contexts/SocketContext"
import {
  fetchModuleById,
  fetchModuleActivity,
  fetchModuleStudents,
  fetchModuleResources,
  fetchModulePastExamPapers,
} from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveLine } from "@nivo/line"
import { ResponsivePie } from "@nivo/pie"
import { ResponsiveBar } from "@nivo/bar"
import { BookOpen, Users, FileText, Calendar } from "lucide-react"
import Header from "../components/navigation/Header"
import { exportToExcel } from "../utils/exportUtils"

const ModuleDetailPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>()
  const socket = useSocket()
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch module data
  const {
    data: module,
    isLoading: isLoadingModule,
    isError: isErrorModule,
    error: errorModule,
  } = useQuery(["module", moduleId], () => fetchModuleById(moduleId!), {
    refetchOnWindowFocus: false,
    enabled: !!moduleId,
  })

  // Fetch module activity
  const {
    data: activity,
    isLoading: isLoadingActivity,
    refetch: refetchActivity,
  } = useQuery(
    ["moduleActivity", moduleId],
    () => fetchModuleActivity(moduleId!, 90), // Get 90 days of activity
    {
      refetchOnWindowFocus: false,
      enabled: !!moduleId,
    },
  )

  // Fetch module students
  const { data: students, isLoading: isLoadingStudents } = useQuery(
    ["moduleStudents", moduleId],
    () => fetchModuleStudents(moduleId!, 1, 100, {}),
    {
      refetchOnWindowFocus: false,
      enabled: !!moduleId,
    },
  )

  // Fetch module resources
  const { data: resources, isLoading: isLoadingResources } = useQuery(
    ["moduleResources", moduleId],
    () => fetchModuleResources(moduleId!),
    {
      refetchOnWindowFocus: false,
      enabled: !!moduleId,
    },
  )

  // Fetch module past exam papers
  const { data: pastExamPapers, isLoading: isLoadingPastExamPapers } = useQuery(
    ["modulePastExamPapers", moduleId],
    () => fetchModulePastExamPapers(moduleId!),
    {
      refetchOnWindowFocus: false,
      enabled: !!moduleId,
    },
  )

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on("newEvent", (event) => {
        // Only refetch if the event is for this module
        if (event.moduleId === moduleId) {
          refetchActivity()
        }
      })

      return () => {
        socket.off("newEvent")
      }
    }
  }, [socket, moduleId, refetchActivity])

  // Handle export
  const handleExport = () => {
    if (module && activity && students && resources) {
      exportToExcel(
        [
          {
            sheetName: "Module Info",
            data: [
              {
                module_id: module.module_id,
                module_code: module.module_code,
                title: module.title,
                description: module.description,
                instructor_id: module.instructor_id,
                created_at: module.created_at,
              },
            ],
          },
          {
            sheetName: "Activity Summary",
            data: [
              {
                totalEvents: activity.totalEvents,
                pageViews: activity.eventCounts?.page_view || 0,
                resourceAccesses: activity.eventCounts?.resource_access || 0,
                totalTimeSpentMinutes: activity.totalTimeSpentMinutes,
              },
            ],
          },
          {
            sheetName: "Students",
            data: students.students.map((student: any) => ({
              student_id: student.student_id,
              first_name: student.first_name,
              last_name: student.last_name,
              email: student.email,
              program_code: student.program_code,
              level: student.level,
              enrolled_at: student.enrolled_at,
            })),
          },
          {
            sheetName: "Resources",
            data: resources.map((resource: any) => ({
              resource_id: resource.resource_id,
              title: resource.title,
              type: resource.type,
              url: resource.url,
              created_at: resource.created_at,
            })),
          },
          {
            sheetName: "Past Exam Papers",
            data: pastExamPapers.map((paper: any) => ({
              paper_id: paper.paper_id,
              year: paper.year,
              description: paper.description,
              document_path: paper.document_path,
              document_size: paper.document_size,
            })),
          },
        ],
        `Module_${moduleId}_Analytics_${new Date().toISOString().split("T")[0]}`,
      )
    }
  }

  if (isLoadingModule) {
    return <LoadingSpinner />
  }

  if (isErrorModule) {
    return <ErrorDisplay error={errorModule as Error} />
  }

  if (!module) {
    return <ErrorDisplay error={new Error(`Module with ID ${moduleId} not found`)} />
  }

  return (
    <div className="flex flex-col h-full">
      <Header onExport={handleExport} />

      <div className="p-6 bg-gray-50 dark:bg-gray-900 flex-1 overflow-y-auto transition-colors duration-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{module.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">Module Code: {module.module_code || "N/A"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Module Code</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{module.module_code || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Students</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isLoadingStudents ? "Loading..." : students?.total || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resources</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isLoadingResources ? "Loading..." : resources?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {module.created_at ? new Date(module.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Module Information</CardTitle>
                  <CardDescription>Details about this module</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{module.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Module Code</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{module.module_code || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{module.instructor_id || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {module.created_at ? new Date(module.created_at).toLocaleDateString() : "N/A"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {module.description || "No description available"}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                  <CardDescription>Overview of module activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : activity ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activity.totalEvents}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Page Views</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {activity.eventCounts?.page_view || 0}
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resource Accesses</p>
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {activity.eventCounts?.resource_access || 0}
                          </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Spent</p>
                          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {activity.totalTimeSpentMinutes || 0} min
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Event Distribution
                        </h4>
                        <div className="h-64">
                          <ResponsivePie
                            data={Object.entries(activity.eventCounts || {}).map(([key, value]) => ({
                              id: key,
                              label: key
                                .split("_")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" "),
                              value: value as number,
                            }))}
                            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                            innerRadius={0.5}
                            padAngle={0.7}
                            cornerRadius={3}
                            activeOuterRadiusOffset={8}
                            colors={{ scheme: "blues" }}
                            borderWidth={1}
                            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                            arcLinkLabelsSkipAngle={10}
                            arcLinkLabelsTextColor={{ from: "color", modifiers: [] }}
                            arcLinkLabelsThickness={2}
                            arcLinkLabelsColor={{ from: "color" }}
                            arcLabelsSkipAngle={10}
                            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No activity data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Module activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : activity && activity.eventsByDay ? (
                    <div className="h-80">
                      <ResponsiveLine
                        data={[
                          {
                            id: "Activity",
                            color: "hsl(210, 70%, 50%)",
                            data: Object.entries(activity.eventsByDay)
                              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                              .map(([day, count]) => ({
                                x: day,
                                y: count as number,
                              })),
                          },
                        ]}
                        margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
                        xScale={{ type: "point" }}
                        yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: -45,
                          legend: "Date",
                          legendOffset: 50,
                          legendPosition: "middle",
                        }}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: "Events",
                          legendOffset: -40,
                          legendPosition: "middle",
                        }}
                        colors={{ scheme: "blues" }}
                        pointSize={10}
                        pointColor={{ theme: "background" }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: "serieColor" }}
                        pointLabel="y"
                        pointLabelYOffset={-12}
                        useMesh={true}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No activity data available</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Event Types</CardTitle>
                    <CardDescription>Breakdown of different event types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingActivity ? (
                      <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                      </div>
                    ) : activity && activity.eventCounts ? (
                      <div className="h-80">
                        <ResponsiveBar
                          data={Object.entries(activity.eventCounts || {}).map(([key, value]) => ({
                            eventType: key
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" "),
                            count: value as number,
                          }))}
                          keys={["count"]}
                          indexBy="eventType"
                          margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
                          padding={0.3}
                          valueScale={{ type: "linear" }}
                          indexScale={{ type: "band", round: true }}
                          colors={{ scheme: "blues" }}
                          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                          axisTop={null}
                          axisRight={null}
                          axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: -45,
                            legend: "Event Type",
                            legendPosition: "middle",
                            legendOffset: 50,
                          }}
                          axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "Count",
                            legendPosition: "middle",
                            legendOffset: -40,
                          }}
                          labelSkipWidth={12}
                          labelSkipHeight={12}
                          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                                                  animate={true}
            motionConfig="elastic"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No event data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Time Spent Distribution</CardTitle>
                    <CardDescription>How students spend time on this module</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingActivity ? (
                      <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                      </div>
                    ) : activity && activity.timeSpentByStudent ? (
                      <div className="h-80">
                        <ResponsiveBar
                          data={activity.timeSpentByStudent.slice(0, 10).map((item: any) => ({
                            student: item.student_id.substring(0, 8),
                            minutes: Math.round(item.time_spent / 60000),
                          }))}
                          keys={["minutes"]}
                          indexBy="student"
                          margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                          padding={0.3}
                          valueScale={{ type: "linear" }}
                          indexScale={{ type: "band", round: true }}
                          colors={{ scheme: "blues" }}
                          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                          axisTop={null}
                          axisRight={null}
                          axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: -45,
                            legend: "Student",
                            legendPosition: "middle",
                            legendOffset: 40,
                          }}
                          axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "Minutes",
                            legendPosition: "middle",
                            legendOffset: -40,
                          }}
                          labelSkipWidth={12}
                          labelSkipHeight={12}
                          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                          animate={true}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No time spent data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Students enrolled in this module</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStudents ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                  </div>
                ) : students && students.students && students.students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Student ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Program
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Enrolled Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Last Accessed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {students.students.map((student: any, index: number) => (
                          <tr
                            key={student.student_id}
                            className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                              <a href={`/students/${student.student_id}`} className="hover:underline">
                                {student.student_id}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {student.first_name} {student.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.program_code || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.level || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.last_accessed_at
                                ? new Date(student.last_accessed_at).toLocaleDateString()
                                : "Never"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No students enrolled in this module
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>Top students by activity level</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : activity && activity.studentEngagement ? (
                    <div className="h-80">
                      <ResponsiveBar
                        data={activity.studentEngagement.slice(0, 10).map((student: any) => ({
                          student: student.student_id.substring(0, 8),
                          events: student.event_count,
                        }))}
                        keys={["events"]}
                        indexBy="student"
                        margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                        padding={0.3}
                        valueScale={{ type: "linear" }}
                        indexScale={{ type: "band", round: true }}
                        colors={{ scheme: "blues" }}
                        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: -45,
                          legend: "Student",
                          legendPosition: "middle",
                          legendOffset: 40,
                        }}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: "Events",
                          legendPosition: "middle",
                          legendOffset: -40,
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                        animate={true}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No student engagement data available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Student Distribution</CardTitle>
                  <CardDescription>Students by program and level</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStudents ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : students && students.students && students.students.length > 0 ? (
                    <div className="h-80">
                      <ResponsivePie
                        data={(() => {
                          // Group students by level
                          const levelCounts: Record<string, number> = {}
                          students.students.forEach((student: any) => {
                            const level = student.level || "Unknown"
                            levelCounts[level] = (levelCounts[level] || 0) + 1
                          })

                          return Object.entries(levelCounts).map(([level, count]) => ({
                            id: level,
                            label: level,
                            value: count,
                          }))
                        })()}
                        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
                        innerRadius={0.5}
                        padAngle={0.7}
                        cornerRadius={3}
                        activeOuterRadiusOffset={8}
                        colors={{ scheme: "blues" }}
                        borderWidth={1}
                        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                        arcLinkLabelsSkipAngle={10}
                        arcLinkLabelsTextColor={{ from: "color", modifiers: [] }}
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsColor={{ from: "color" }}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                        legends={[
                          {
                            anchor: "bottom",
                            direction: "row",
                            justify: false,
                            translateX: 0,
                            translateY: 56,
                            itemsSpacing: 0,
                            itemWidth: 100,
                            itemHeight: 18,
                            itemTextColor: "#999",
                            itemDirection: "left-to-right",
                            itemOpacity: 1,
                            symbolSize: 18,
                            symbolShape: "circle",
                          },
                        ]}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No student distribution data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Module Resources</CardTitle>
                  <CardDescription>Resources available in this module</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingResources ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : resources && resources.length > 0 ? (
                    <div className="overflow-y-auto max-h-96">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                          {resources.map((resource: any, index: number) => (
                            <tr
                              key={resource.resource_id}
                              className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {resource.url ? (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    {resource.title}
                                  </a>
                                ) : (
                                  resource.title
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {resource.type || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No resources found for this module
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Past Exam Papers</CardTitle>
                  <CardDescription>Past exam papers for this module</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPastExamPapers ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : pastExamPapers && pastExamPapers.length > 0 ? (
                    <div className="overflow-y-auto max-h-96">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Size
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                          {pastExamPapers.map((paper: any, index: number) => (
                            <tr
                              key={paper.paper_id}
                              className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {paper.document_path ? (
                                  <a
                                    href={paper.document_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    {paper.description || "Unnamed Exam Paper"}
                                  </a>
                                ) : (
                                  paper.description || "Unnamed Exam Paper"
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {paper.year || "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {paper.document_size || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No past exam papers found for this module
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-md mt-6">
              <CardHeader>
                <CardTitle>Resource Access Statistics</CardTitle>
                <CardDescription>Most accessed resources in this module</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                  </div>
                ) : activity && activity.resourceAccesses ? (
                  <div className="h-80">
                    <ResponsiveBar
                      data={activity.resourceAccesses.slice(0, 10).map((resource: any) => ({
                        resource: resource.title.substring(0, 20) + (resource.title.length > 20 ? "..." : ""),
                        accesses: resource.access_count,
                      }))}
                      keys={["accesses"]}
                      indexBy="resource"
                      margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
                      padding={0.3}
                      valueScale={{ type: "linear" }}
                      indexScale={{ type: "band", round: true }}
                      colors={{ scheme: "blues" }}
                      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "Resource",
                        legendPosition: "middle",
                        legendOffset: 50,
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Access Count",
                        legendPosition: "middle",
                        legendOffset: -40,
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                      animate={true}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No resource access data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ModuleDetailPage

