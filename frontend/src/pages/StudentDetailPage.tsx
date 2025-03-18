"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "react-query"
import { useSocket } from "../contexts/SocketContext"
import {
  fetchStudentById,
  fetchStudentActivity,
  fetchStudentModules,
  fetchStudentFacultyStats,
  fetchStudentProgramStats,
} from "../services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Download, User, BookOpen, School, Calendar, BarChart2, Activity, ArrowLeft } from "lucide-react"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { exportToExcel } from "../utils/exportUtils"
import { Badge } from "../components/ui/badge"
import Header from "../components/navigation/Header"
import ActivityTimeline from "../components/dashboard/ActivityTimeLine"
import ActivityHeatmap from "../components/dashboard/ActivityHeatMap"
import ResourceAccessChart from "../components/dashboard/ResourceAccessChart"
import Progress from "../components/common/Progress"
import StudentEngagementComparison from "../components/student/StudentEngagementComparison"
import StudentModulesTable from "../components/student/StudentModulesTable"

const StudentDetailPage = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const socket = useSocket()
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch student data
  const {
    data: student,
    isLoading: isLoadingStudent,
    isError: isErrorStudent,
    error: errorStudent,
    refetch: refetchStudent,
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
  const {
    data: modules,
    isLoading: isLoadingModules,
    refetch: refetchModules,
  } = useQuery(["studentModules", studentId], () => fetchStudentModules(studentId!), {
    refetchOnWindowFocus: false,
    enabled: !!studentId,
  })

  // Fetch student faculty stats
  const {
    data: facultyStats,
    isLoading: isLoadingFacultyStats,
    refetch: refetchFacultyStats,
  } = useQuery(["studentFacultyStats", studentId], () => fetchStudentFacultyStats(studentId!), {
    refetchOnWindowFocus: false,
    enabled: !!studentId,
  })

  // Fetch student program stats
  const {
    data: programStats,
    isLoading: isLoadingProgramStats,
    refetch: refetchProgramStats,
  } = useQuery(["studentProgramStats", studentId], () => fetchStudentProgramStats(studentId!), {
    refetchOnWindowFocus: false,
    enabled: !!studentId,
  })

  // Listen for real-time updates
  useEffect(() => {
    if (socket && studentId) {
      socket.on("newEvent", (event) => {
        if (event.studentId === studentId) {
          refetchStudent()
          refetchActivity()
          refetchModules()
          refetchFacultyStats()
          refetchProgramStats()
        }
      })

      return () => {
        socket.off("newEvent")
      }
    }
  }, [socket, studentId, refetchStudent, refetchActivity, refetchModules, refetchFacultyStats, refetchProgramStats])

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
              last_accessed_at: module.last_accessed_at,
              engagement_score: module.engagement_score,
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

  const isLoading =
    isLoadingStudent || isLoadingActivity || isLoadingModules || isLoadingFacultyStats || isLoadingProgramStats
  const isError = isErrorStudent
  const error = errorStudent

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return <ErrorDisplay error={error as Error} />
  }

  if (!student) {
    return <ErrorDisplay error={new Error(`Student with ID ${studentId} not found`)} />
  }

  return (
    <div className="flex flex-col h-full">
      <Header onExport={handleExport} />

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/students" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">
                {student.first_name} {student.last_name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{student.student_id}</Badge>
              <Badge variant="secondary">{student.program_code}</Badge>
            </div>
          </div>

          <Button onClick={handleExport} className="flex items-center gap-2 w-full md:w-auto">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Program</p>
                  <p className="text-2xl font-bold">{student.program_code}</p>
                </div>
                <div className="p-2 rounded-full text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                  <p className="text-2xl font-bold">{student.faculty_code}</p>
                </div>
                <div className="p-2 rounded-full text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-950">
                  <School className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold">{student.level}</p>
                </div>
                <div className="p-2 rounded-full text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-950">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Active</p>
                  <p className="text-2xl font-bold">
                    {student.last_active_at ? new Date(student.last_active_at).toLocaleDateString() : "Never"}
                  </p>
                </div>
                <div className="p-2 rounded-full text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Modules</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Comparison</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>Personal and academic details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Full Name:</dt>
                          <dd className="font-medium">
                            {student.first_name} {student.last_name}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Student ID:</dt>
                          <dd className="font-medium">{student.student_id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Email:</dt>
                          <dd className="font-medium">{student.email || "N/A"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Phone:</dt>
                          <dd className="font-medium">{student.phone || "N/A"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">National ID:</dt>
                          <dd className="font-medium">{student.national_id || "N/A"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Date of Birth:</dt>
                          <dd className="font-medium">
                            {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : "N/A"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Gender:</dt>
                          <dd className="font-medium">{student.gender || "N/A"}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Academic Information</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Program:</dt>
                          <dd className="font-medium">{student.program_name || student.program_code}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Faculty:</dt>
                          <dd className="font-medium">{student.faculty_name || student.faculty_code}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Level:</dt>
                          <dd className="font-medium">{student.level || "N/A"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Enrolled Modules:</dt>
                          <dd className="font-medium">{modules?.length || 0}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Last Active:</dt>
                          <dd className="font-medium">
                            {student.last_active_at ? new Date(student.last_active_at).toLocaleDateString() : "Never"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                  <CardDescription>Overview of student's activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity ? (
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
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Spent</p>
                          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {activity.totalTimeSpentMinutes || 0} min
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Event Distribution
                        </h4>
                        <div className="h-64">
                          <ActivityTimeline data={activity} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No activity data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Resources Accessed</CardTitle>
                  <CardDescription>Most accessed resources</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResourceAccessChart data={activity} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Activity Heatmap</CardTitle>
                  <CardDescription>Activity patterns by day and hour</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ActivityHeatmap data={activity} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Student activity over time</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ActivityTimeline data={activity} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Activity by Time</CardTitle>
                  <CardDescription>When student is most active</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ActivityHeatmap data={activity} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Activity by Type</CardTitle>
                  <CardDescription>Types of student activities</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Activity types visualization
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Time Spent</CardTitle>
                  <CardDescription>Time spent on different modules</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Time spent visualization
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <StudentModulesTable modules={modules} studentId={""} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Faculty Comparison</CardTitle>
                  <CardDescription>Compared to faculty peers</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {facultyStats && (
                  <StudentEngagementComparison
                    studentData={{
                    studentId: studentId || '',
                    studentName: `${student.first_name} ${student.last_name}`,
                    metrics: {
                      pageViews: facultyStats.studentMetrics?.pageViews || 0,
                      timeSpentMinutes: facultyStats.studentMetrics?.timeSpentMinutes || 0,
                      resourcesAccessed: facultyStats.studentMetrics?.resourcesAccessed || 0,
                      quizAttempts: facultyStats.studentMetrics?.quizAttempts || 0,
                      forumPosts: facultyStats.studentMetrics?.forumPosts || 0,
                      assignmentSubmissions: facultyStats.studentMetrics?.assignmentSubmissions || 0,
                    },
                    dailyActivity: facultyStats.dailyActivity || [],
                    modulePerformance: facultyStats.modulePerformance || []
                    }}
                    classAverages={facultyStats.classAverages || {
                    pageViews: 0,
                    timeSpentMinutes: 0,
                    resourcesAccessed: 0,
                    quizAttempts: 0,
                    forumPosts: 0,
                    assignmentSubmissions: 0
                    }}
                    programAverages={facultyStats.programAverages || {
                    pageViews: 0,
                    timeSpentMinutes: 0,
                    resourcesAccessed: 0,
                    quizAttempts: 0,
                    forumPosts: 0,
                    assignmentSubmissions: 0
                    }}
                  />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Program Comparison</CardTitle>
                  <CardDescription>Compared to program peers</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {programStats && (
                    <StudentEngagementComparison
                      studentData={{
                        studentId: studentId || '',
                        studentName: `${student.first_name} ${student.last_name}`,
                        metrics: {
                          pageViews: programStats.studentMetrics?.pageViews || 0,
                          timeSpentMinutes: programStats.studentMetrics?.timeSpentMinutes || 0,
                          resourcesAccessed: programStats.studentMetrics?.resourcesAccessed || 0,
                          quizAttempts: programStats.studentMetrics?.quizAttempts || 0,
                          forumPosts: programStats.studentMetrics?.forumPosts || 0,
                          assignmentSubmissions: programStats.studentMetrics?.assignmentSubmissions || 0,
                        },
                        dailyActivity: programStats.dailyActivity || [],
                        modulePerformance: programStats.modulePerformance || []
                      }}
                      classAverages={programStats.classAverages || {
                        pageViews: 0,
                        timeSpentMinutes: 0,
                        resourcesAccessed: 0,
                        quizAttempts: 0,
                        forumPosts: 0,
                        assignmentSubmissions: 0
                      }}
                      programAverages={programStats.programAverages || {
                        pageViews: 0,
                        timeSpentMinutes: 0,
                        resourcesAccessed: 0,
                        quizAttempts: 0,
                        forumPosts: 0,
                        assignmentSubmissions: 0
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Detailed comparison with peers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Faculty Metrics</h3>
                    {facultyStats && (
                      <div className="space-y-4">
                        <div>
                          <Progress
                          title="Faculty Ranking"
                          description="Student's rank within faculty"
                          metrics={[
                            {
                            name: "Activity Rank",
                            value: facultyStats.studentRank,
                            target: facultyStats.totalStudents,
                            unit: "rank",
                            trend: "stable",
                            history: [
                              {
                              date: new Date().toLocaleDateString(),
                              value: facultyStats.studentRank
                              }
                            ]
                            }
                          ]}
                          />
                        </div>

                        <div>
                          <Progress
                          title="Activity Events"
                          description="Student's events compared to faculty average"
                          metrics={[
                            {
                            name: "Events",
                            value: activity?.totalEvents || 0,
                            target: facultyStats.maxEvents,
                            unit: "events",
                            trend: "stable",
                            history: [
                              {
                              date: new Date().toLocaleDateString(),
                              value: activity?.totalEvents || 0
                              }
                            ]
                            }
                          ]}
                          />
                        </div>

                        <div className="pt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Faculty: {facultyStats.facultyName}</span>
                            <span>{facultyStats.totalStudents} students</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Program Metrics</h3>
                    {programStats && (
                      <div className="space-y-4">
                        <div>
                          <Progress
                          title="Program Ranking"
                          description="Student's rank within program"
                          metrics={[
                            {
                            name: "Program Rank",
                            value: programStats.studentRank,
                            target: programStats.totalStudents,
                            unit: "rank",
                            trend: "stable",
                            history: [
                              {
                              date: new Date().toLocaleDateString(),
                              value: programStats.studentRank
                              }
                            ]
                            }
                          ]}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Events</span>
                            <span className="text-sm text-muted-foreground">
                              {activity?.totalEvents || 0} vs avg {Math.round(programStats.averageEvents)}
                            </span>
                          </div>
                          <Progress
                            title="Activity Events"
                            metrics={[
                              {
                                name: "Progress",
                                value: activity?.totalEvents || 0,
                                target: programStats.maxEvents,
                                unit: "events",
                                trend: "stable",
                                history: [
                                  {
                                    date: new Date().toLocaleDateString(),
                                    value: activity?.totalEvents || 0
                                  }
                                ]
                              }
                            ]}
                          />
                        </div>

                        <div className="pt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Level: {programStats.level}</span>
                            <span>{programStats.sameLevelStudents} students</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default StudentDetailPage

