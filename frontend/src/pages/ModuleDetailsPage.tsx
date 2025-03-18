"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LoadingSpinner  from "../components/common/LoadingSpinner"
import ErrorDisplay  from "../components/common/ErrorDisplay"
import { LineChart, BarChart, PieChart } from "../components/ui/chart"
import { fetchModuleById, fetchModuleActivity, fetchResources } from "../services/api"
import { exportToExcel, exportToCSV, exportToPDF } from "../utils/exportUtils"
import { ArrowLeft, Download, Users, FileText, Clock, Calendar } from "lucide-react"

const ModuleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [module, setModule] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [timeRange, setTimeRange] = useState<number>(30) // Default to 30 days

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)

        // Fetch module details
        const moduleData = await fetchModuleById(id)
        setModule(moduleData)

        // Fetch module activity
        const activityData = await fetchModuleActivity(id, timeRange)
        setActivity(activityData)

        // Fetch module resources
        const resourcesData = await fetchResources({
          moduleId: id,
          limit: 100,
        })
        setResources(resourcesData.resources)

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch module data")
        setLoading(false)
        console.error(err)
      }
    }

    fetchData()
  }, [id, timeRange])

  const handleExport = (type: "excel" | "csv" | "pdf") => {
    if (!module) return

    const activityData = activity.map((item) => ({
      Date: new Date(item.date).toLocaleDateString(),
      "Page Views": item.pageViews,
      "Unique Users": item.uniqueUsers,
      "Time Spent (mins)": Math.round(item.timeSpentMinutes * 10) / 10,
      "Resources Accessed": item.resourcesAccessed,
    }))

    const fileName = `module-${module.moduleCode}-report`

    if (type === "excel") {
      exportToExcel(activityData, fileName)
    } else if (type === "csv") {
      exportToCSV(activityData, fileName)
    } else if (type === "pdf") {
      exportToPDF(activityData, fileName, `Module Report: ${module.name}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !module) {
    return (
      <div className="container mx-auto py-12">
        <ErrorDisplay error={error || "Module not found"} />
        <Button variant="outline" onClick={() => navigate("/modules")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
      </div>
    )
  }

  // Prepare activity data for charts
  const activityChartData = activity.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    pageViews: item.pageViews,
    uniqueUsers: item.uniqueUsers,
    timeSpent: Math.round(item.timeSpentMinutes * 10) / 10,
  }))

  // Prepare resource access data
  const resourceAccessData = resources
    .sort((a, b) => b.accessCount - a.accessCount)
    .slice(0, 10)
    .map((resource) => ({
      name: resource.title.length > 20 ? resource.title.substring(0, 20) + "..." : resource.title,
      value: resource.accessCount,
    }))

  // Prepare event type distribution data
  const eventTypeData = [
    { name: "Page View", value: module.eventCounts?.pageView || 0 },
    { name: "Resource Access", value: module.eventCounts?.resourceAccess || 0 },
    { name: "Quiz Attempt", value: module.eventCounts?.quizAttempt || 0 },
    { name: "Forum Post", value: module.eventCounts?.forumPost || 0 },
    { name: "Assignment Submit", value: module.eventCounts?.assignmentSubmit || 0 },
  ]

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Students</p>
                <h3 className="text-2xl font-bold mt-1">{module.studentCount}</h3>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resources</p>
                <h3 className="text-2xl font-bold mt-1">{module.resourceCount}</h3>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time (mins/day)</p>
                <h3 className="text-2xl font-bold mt-1">{module.avgTimeSpentMinutes?.toFixed(1) || "0.0"}</h3>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Days</p>
                <h3 className="text-2xl font-bold mt-1">{module.activeDaysCount || 0}</h3>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Over Time</CardTitle>
                <Select value={timeRange.toString()} onValueChange={(val) => setTimeRange(Number.parseInt(val))}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <LineChart
                data={activityChartData}
                index="date"
                categories={["pageViews", "uniqueUsers"]}
                colors={["blue", "green"]}
                valueFormatter={(value: any) => `${value}`}
                yAxisWidth={40}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Time Spent (minutes)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <LineChart
                data={activityChartData}
                index="date"
                categories={["timeSpent"]}
                colors={["purple"]}
                valueFormatter={(value: any) => `${value} mins`}
                yAxisWidth={50}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Top Resources by Access</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                data={resourceAccessData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value: any) => `${value} accesses`}
                yAxisWidth={40}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Event Type Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex justify-center items-center">
              <div className="w-full h-full max-w-xs">
                <PieChart
                  data={eventTypeData}
                  index="name"
                  categories={["value"]}
                  colors={["blue", "green", "yellow", "purple", "red"]}
                  valueFormatter={(value: any) => `${value} events`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderStudents = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>
              Students enrolled in {module.name} ({module.moduleCode})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Activity Level</TableHead>
                  <TableHead>Last Access</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {module.students && module.students.length > 0 ? (
                  module.students.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.programCode}</TableCell>
                      <TableCell>{student.level}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.activityLevel === "High"
                              ? "default"
                              : student.activityLevel === "Medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {student.activityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.lastAccess ? new Date(student.lastAccess).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/students/${student.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No students enrolled
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Engagement Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart
              data={[
                { name: "High", value: module.studentEngagement?.high || 0 },
                { name: "Medium", value: module.studentEngagement?.medium || 0 },
                { name: "Low", value: module.studentEngagement?.low || 0 },
                { name: "None", value: module.studentEngagement?.none || 0 },
              ]}
              index="name"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value: any) => `${value} students`}
              yAxisWidth={40}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderResources = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Module Resources</CardTitle>
            <CardDescription>
              Resources available in {module.name} ({module.moduleCode})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Access Count</TableHead>
                  <TableHead>Unique Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources && resources.length > 0 ? (
                  resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>{resource.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.type}</Badge>
                      </TableCell>
                      <TableCell>{resource.size ? `${(resource.size / 1024).toFixed(1)} KB` : "N/A"}</TableCell>
                      <TableCell>
                        {resource.uploadedAt ? new Date(resource.uploadedAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>{resource.accessCount}</TableCell>
                      <TableCell>{resource.uniqueUsers}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No resources found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Access Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <LineChart
              data={activity.map((item) => ({
                date: new Date(item.date).toLocaleDateString(),
                resourceAccess: item.resourcesAccessed,
              }))}
              index="date"
              categories={["resourceAccess"]}
              colors={["green"]}
              valueFormatter={(value: any) => `${value} accesses`}
              yAxisWidth={50}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/modules")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{module.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">{module.moduleCode}</p>
              <Badge variant="outline">{module.facultyCode}</Badge>
              <Badge variant="outline">{module.programCode}</Badge>
              <Badge
                variant={
                  module.activityLevel === "High"
                    ? "default"
                    : module.activityLevel === "Medium"
                      ? "secondary"
                      : "outline"
                }
              >
                {module.activityLevel} Activity
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>
        <TabsContent value="students" className="mt-6">
          {renderStudents()}
        </TabsContent>
        <TabsContent value="resources" className="mt-6">
          {renderResources()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ModuleDetailPage

