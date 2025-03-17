"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { useSocket } from "../contexts/SocketContext"
import {
  fetchStudentById,
  fetchStudentActivity,
  fetchStudentModules,
  fetchStudentFacultyStats,
  fetchStudentProgramStats,
} from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveLine } from "@nivo/line"
import { ResponsivePie } from "@nivo/pie"
import { ResponsiveBar } from "@nivo/bar"
import { ResponsiveCalendar } from "@nivo/calendar"
import { User, BookOpen, School, Calendar, FileText } from "lucide-react"
import Header from "../components/navigation/Header"
import { exportToExcel } from "../utils/exportUtils"

const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const socket = useSocket()
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch student data
  const {
    data: student,
    isLoading: isLoadingStudent,
    isError: isErrorStudent,
    error: errorStudent,
  } = useQuery(["student", studentId], () => fetchStudentById(studentId!), {
    refetchOnWindowFocus: false,
    enabled: !!studentId,
  })

  // Fetch student activity
  const {
    data: activity,
    isLoading: isLoadingActivity,
    refetch: refetchActivity,
  } = useQuery(
    ["studentActivity", studentId],
    () => fetchStudentActivity(studentId!, 90), // Get 90 days of activity
    {
      refetchOnWindowFocus: false,
      enabled: !!studentId,
    },
  )

  // Fetch student modules
  const { data: modules, isLoading: isLoadingModules } = useQuery(
    ["studentModules", studentId],
    () => fetchStudentModules(studentId!),
    {
      refetchOnWindowFocus: false,
      enabled: !!studentId,
    },
  )

  // Fetch student faculty stats
  const { data: facultyStats, isLoading: isLoadingFacultyStats } = useQuery(
    ["studentFacultyStats", studentId],
    () => fetchStudentFacultyStats(studentId!),
    {
      refetchOnWindowFocus: false,
      enabled: !!studentId,
    },
  )

  // Fetch student program stats
  const { data: programStats, isLoading: isLoadingProgramStats } = useQuery(
    ["studentProgramStats", studentId],
    () => fetchStudentProgramStats(studentId!),
    {
      refetchOnWindowFocus: false,
      enabled: !!studentId,
    },
  )

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on("newEvent", (event) => {
        // Only refetch if the event is for this student
        if (event.studentId === studentId) {
          refetchActivity()
        }
      })

      return () => {
        socket.off("newEvent")
      }
    }
  }, [socket, studentId, refetchActivity])

  // Handle export
  const handleExport = () => {
    if (student && activity && modules) {
      exportToExcel(
        [
          {
            sheetName: "Student Info",
            data: [
              {
                student_id: student.student_id,
                first_name: student.first_name,
                last_name: student.last_name,
                email: student.email,
                program_code: student.program_code,
                program_name: student.program_name,
                faculty_code: student.faculty_code,
                faculty_name: student.faculty_name,
                level: student.level,
                last_active_at: student.last_active_at,
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
                moduleViews: activity.eventCounts?.module_list_view || 0,
                pastExamAccesses: activity.eventCounts?.past_exam_access || 0,
                totalTimeSpentMinutes: activity.totalTimeSpentMinutes,
              },
            ],
          },
          {
            sheetName: "Modules",
            data: modules.map((module: any) => ({
              module_id: module.module_id,
              module_code: module.module_code,
              title: module.title,
              enrolled_at: module.enrolled_at,
            })),
          },
          {
            sheetName: "Daily Activity",
            data: Object.entries(activity.eventsByDay || {}).map(([day, count]) => ({
              date: day,
              events: count,
            })),
          },
        ],
        `Student_${studentId}_Analytics_${new Date().toISOString().split("T")[0]}`,
      )
    }
  }

  if (isLoadingStudent) {
    return <LoadingSpinner />
  }

  if (isErrorStudent) {
    return <ErrorDisplay error={errorStudent as Error} />
  }

  if (!student) {
    return <ErrorDisplay error={new Error(`Student with ID ${studentId} not found`)} />
  }

  return (
    <div className="flex flex-col h-full">
      <Header onExport={handleExport} />

      <div className="p-6 bg-gray-50 dark:bg-gray-900 flex-1 overflow-y-auto transition-colors duration-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {student.first_name} {student.last_name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Student ID: {student.student_id}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{student.program_code}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
                  <School className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Faculty</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{student.faculty_code}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{student.level}</p>
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Active</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {student.last_active_at ? new Date(student.last_active_at).toLocaleDateString() : "Never"}
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
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>Personal and academic details</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {student.first_name} {student.last_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Student ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{student.student_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{student.email || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{student.phone || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">National ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{student.national_id || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{student.gender || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{student.program_name || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Faculty</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{student.faculty_name || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{student.level || "N/A"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                  <CardDescription>Overview of student's activity</CardDescription>
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
                  <CardDescription>Student activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : activity && activity.eventsByDay ? (
                    <div className="h-96">
                      <ResponsiveCalendar
                        data={Object.entries(activity.eventsByDay).map(([day, count]) => ({
                          day,
                          value: count as number,
                        }))}
                        from={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                        to={new Date().toISOString().split("T")[0]}
                        emptyColor="#eeeeee"
                        colors={["#caf0f8", "#90e0ef", "#48cae4", "#00b4d8", "#0077b6"]}
                        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                        yearSpacing={40}
                        monthBorderColor="#ffffff"
                        dayBorderWidth={2}
                        dayBorderColor="#ffffff"
                        legends={[
                          {
                            anchor: "bottom-right",
                            direction: "row",
                            translateY: 36,
                            itemCount: 4,
                            itemWidth: 42,
                            itemHeight: 36,
                            itemsSpacing: 14,
                            itemDirection: "right-to-left",
                          },
                        ]}
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
                    <CardTitle>Daily Activity</CardTitle>
                    <CardDescription>Activity trends over time</CardDescription>
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="mt-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Enrolled Modules</CardTitle>
                <CardDescription>Modules the student is currently enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingModules ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                  </div>
                ) : modules && modules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Module Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Title
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
                        {modules.map((module: any, index: number) => (
                          <tr
                            key={module.module_id}
                            className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                              {module.module_code || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {module.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {module.enrolled_at ? new Date(module.enrolled_at).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {module.last_accessed_at
                                ? new Date(module.last_accessed_at).toLocaleDateString()
                                : "Never"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No modules found for this student</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Module Engagement</CardTitle>
                  <CardDescription>Activity across different modules</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity || isLoadingModules ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : activity && modules && modules.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveBar
                        data={modules.slice(0, 10).map((module: any) => {
                          // Find module-related events in activity data
                          const moduleEvents = (activity.moduleEvents || []).filter(
                            (event: any) => event.moduleId === module.module_id,
                          ).length

                          return {
                            module: module.module_code || module.title.substring(0, 10),
                            views: moduleEvents,
                            resources: Math.floor(moduleEvents * 0.4), // Placeholder data
                            exams: Math.floor(moduleEvents * 0.2), // Placeholder data
                          }
                        })}
                        keys={["views", "resources", "exams"]}
                        indexBy="module"
                        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                        padding={0.3}
                        groupMode="grouped"
                        valueScale={{ type: "linear" }}
                        indexScale={{ type: "band", round: true }}
                        colors={["#0077b6", "#00b4d8", "#90e0ef"]}
                        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: -45,
                          legend: "Module",
                          legendPosition: "middle",
                          legendOffset: 40,
                        }}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: "Activity Count",
                          legendPosition: "middle",
                          legendOffset: -40,
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                        legends={[
                          {
                            dataFrom: "keys",
                            anchor: "bottom-right",
                            direction: "column",
                            justify: false,
                            translateX: 120,
                            translateY: 0,
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: "left-to-right",
                            itemOpacity: 0.85,
                            symbolSize: 20,
                            effects: [
                              {
                                on: "hover",
                                style: {
                                  itemOpacity: 1,
                                },
                              },
                            ],
                          },
                        ]}
                        animate={true}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No module engagement data available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Past Exam Paper Access</CardTitle>
                  <CardDescription>Past exam papers accessed by the student</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActivity ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : activity && activity.pastExamAccesses && activity.pastExamAccesses.length > 0 ? (
                    <div className="overflow-y-auto max-h-80">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activity.pastExamAccesses.map((access: any, index: number) => (
                          <li key={index} className="py-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {access.description || "Unnamed Exam Paper"}
                                </p>
                                <div className="flex space-x-4 mt-1">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Module:</span> {access.module_code || "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Year:</span> {access.year || "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Accessed:</span>{" "}
                                    {new Date(access.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No past exam paper access data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Faculty Comparison</CardTitle>
                  <CardDescription>How this student compares to others in the same faculty</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFacultyStats ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : facultyStats ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Faculty</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {facultyStats.facultyName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{facultyStats.facultyCode}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {facultyStats.totalStudents}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Activity Ranking</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-full"
                            style={{
                              width: `${facultyStats.studentRank ? (facultyStats.studentRank / facultyStats.totalStudents) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Rank {facultyStats.studentRank || "N/A"} of {facultyStats.totalStudents} students
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Events</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {activity?.totalEvents || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Faculty Average</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {Math.round(facultyStats.averageEvents || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Faculty Max</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {facultyStats.maxEvents || 0}
                          </p>
                        </div>
                      </div>

                      <div className="h-64">
                        <ResponsiveBar
                          data={[
                            {
                              category: "Your Activity",
                              value: activity?.totalEvents || 0,
                            },
                            {
                              category: "Faculty Min",
                              value: facultyStats.minEvents || 0,
                            },
                            {
                              category: "Faculty Avg",
                              value: Math.round(facultyStats.averageEvents || 0),
                            },
                            {
                              category: "Faculty Max",
                              value: facultyStats.maxEvents || 0,
                            },
                          ]}
                          keys={["value"]}
                          indexBy="category"
                          margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                          padding={0.3}
                          valueScale={{ type: "linear" }}
                          indexScale={{ type: "band", round: true }}
                          colors={({ data }) => (data.category === "Your Activity" ? "#0077b6" : "#90e0ef")}
                          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                          axisTop={null}
                          axisRight={null}
                          axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "Category",
                            legendPosition: "middle",
                            legendOffset: 32,
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
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No faculty comparison data available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Program Comparison</CardTitle>
                  <CardDescription>How this student compares to others in the same program</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProgramStats ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : programStats ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</p>
                          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {programStats.programName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{programStats.programCode}</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</p>
                          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{programStats.level}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {programStats.sameLevelStudents} students
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Program Ranking</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-purple-600 dark:bg-purple-500 h-full"
                            style={{
                              width: `${programStats.studentRank ? (programStats.studentRank / programStats.totalStudents) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Rank {programStats.studentRank || "N/A"} of {programStats.totalStudents} students in program
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Events</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {activity?.totalEvents || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Program Average</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {Math.round(programStats.averageEvents || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Program Max</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {programStats.maxEvents || 0}
                          </p>
                        </div>
                      </div>

                      <div className="h-64">
                        <ResponsivePie
                          data={[
                            {
                              id: "Your Activity",
                              label: "Your Activity",
                              value: activity?.totalEvents || 0,
                              color: "#0077b6",
                            },
                            {
                              id: "Program Average",
                              label: "Program Average",
                              value: Math.round(programStats.averageEvents || 0),
                              color: "#00b4d8",
                            },
                          ]}
                          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                          innerRadius={0.5}
                          padAngle={0.7}
                          cornerRadius={3}
                          activeOuterRadiusOffset={8}
                          colors={{ datum: "data.color" }}
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
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No program comparison data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default StudentDetailPage

