import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Bar, BarChart, Legend, LineChart, RadarChart, Tooltip, XAxis, YAxis, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Line } from "recharts"

interface ComparisonData {
  studentId: string
  studentName: string
  metrics: {
    pageViews: number
    timeSpentMinutes: number
    resourcesAccessed: number
    quizAttempts: number
    forumPosts: number
    assignmentSubmissions: number
    averageGrade?: number
  }
  dailyActivity: {
    date: string
    pageViews: number
    timeSpentMinutes: number
  }[]
  modulePerformance: {
    moduleCode: string
    studentScore: number
    classAverage: number
  }[]
}

interface StudentEngagementComparisonProps {
  studentData: ComparisonData
  classAverages: {
    pageViews: number
    timeSpentMinutes: number
    resourcesAccessed: number
    quizAttempts: number
    forumPosts: number
    assignmentSubmissions: number
    averageGrade?: number
  }
  programAverages: {
    pageViews: number
    timeSpentMinutes: number
    resourcesAccessed: number
    quizAttempts: number
    forumPosts: number
    assignmentSubmissions: number
    averageGrade?: number
  }
}

const StudentEngagementComparison: React.FC<StudentEngagementComparisonProps> = ({
  studentData,
  classAverages,
  programAverages,
}) => {
  // Prepare data for engagement metrics comparison
  const engagementData = [
    {
      metric: "Page Views",
      student: studentData.metrics.pageViews,
      class: classAverages.pageViews,
      program: programAverages.pageViews,
    },
    {
      metric: "Time Spent (mins)",
      student: studentData.metrics.timeSpentMinutes,
      class: classAverages.timeSpentMinutes,
      program: programAverages.timeSpentMinutes,
    },
    {
      metric: "Resources",
      student: studentData.metrics.resourcesAccessed,
      class: classAverages.resourcesAccessed,
      program: programAverages.resourcesAccessed,
    },
    {
      metric: "Quiz Attempts",
      student: studentData.metrics.quizAttempts,
      class: classAverages.quizAttempts,
      program: programAverages.quizAttempts,
    },
    {
      metric: "Forum Posts",
      student: studentData.metrics.forumPosts,
      class: classAverages.forumPosts,
      program: programAverages.forumPosts,
    },
    {
      metric: "Assignments",
      student: studentData.metrics.assignmentSubmissions,
      class: classAverages.assignmentSubmissions,
      program: programAverages.assignmentSubmissions,
    },
  ]

  // Prepare data for radar chart
  const radarData = [
    {
      metric: "Page Views",
      student: (studentData.metrics.pageViews / classAverages.pageViews) * 100,
      average: 100,
    },
    {
      metric: "Time Spent",
      student: (studentData.metrics.timeSpentMinutes / classAverages.timeSpentMinutes) * 100,
      average: 100,
    },
    {
      metric: "Resources",
      student: (studentData.metrics.resourcesAccessed / classAverages.resourcesAccessed) * 100,
      average: 100,
    },
    {
      metric: "Quizzes",
      student: (studentData.metrics.quizAttempts / classAverages.quizAttempts) * 100,
      average: 100,
    },
    {
      metric: "Forum",
      student: (studentData.metrics.forumPosts / classAverages.forumPosts) * 100,
      average: 100,
    },
    {
      metric: "Assignments",
      student: (studentData.metrics.assignmentSubmissions / classAverages.assignmentSubmissions) * 100,
      average: 100,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Comparison</CardTitle>
        <CardDescription>Compare student engagement with class and program averages</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="radar">Radar Chart</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="space-y-4">
            <div className="h-[400px] mt-4">
              <BarChart
                data={engagementData}
                width={500}
                height={300}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="student" fill="blue" />
                <Bar dataKey="class" fill="green" />
                <Bar dataKey="program" fill="purple" />
              </BarChart>
            </div>
          </TabsContent>

          <TabsContent value="radar" className="space-y-4">
            <div className="h-[400px] mt-4">
              <RadarChart
                width={500}
                height={300}
                data={radarData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar name="Student" dataKey="student" stroke="#0000FF" fill="#0000FF" fillOpacity={0.6} />
                <Radar name="Average" dataKey="average" stroke="#808080" fill="#808080" fillOpacity={0.6} />
                <Legend />
                <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
              </RadarChart>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="h-[400px] mt-4">
              <LineChart
                width={500}
                height={300}
                data={studentData.dailyActivity}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pageViews" stroke="blue" />
                <Line type="monotone" dataKey="timeSpentMinutes" stroke="green" />
              </LineChart>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Module Performance</h3>
          <div className="h-[300px]">
            <BarChart
              data={studentData.modulePerformance}
              width={500}
              height={300}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="moduleCode" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="studentScore" fill="blue" />
              <Bar dataKey="classAverage" fill="gray" />
            </BarChart>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StudentEngagementComparison

