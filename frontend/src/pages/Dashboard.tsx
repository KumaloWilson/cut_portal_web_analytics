"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { useSocket } from "../contexts/SocketContext"
import { fetchDashboardData, fetchFacultyStats, fetchProgramStats } from "../services/api"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import OverviewStats from "../components/dashboard/OverviewStats"
import PageViewsChart from "../components/dashboard/PageViewsChart"
import EventFrequencyChart from "../components/dashboard/EventFrequencyChart"
import StudentEngagementTable from "../components/dashboard/StudentEngagementTable"
import TimeSpentChart from "../components/dashboard/TimeSpentChart"
import FacultyDistributionChart from "../components/dashboard/FacultyDistributionChart"
import StudentLevelDistribution from "../components/dashboard/StudentLevelDistribution"
import DateRangePicker from "../components/common/DateRangePicker"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { exportToExcel } from "../utils/exportUtils"
import Header from "../components/navigation/Header"
import ModulePopularityChart from "../components/dashboard/ModulePopularity"
import ActivityHeatmap from "../components/dashboard/ActivityHeatMap"

const Dashboard: React.FC = () => {
  const socket = useSocket()
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  })

  // Fetch dashboard data
  const { data, isLoading, isError, error, refetch } = useQuery(
    ["dashboardData", dateRange],
    () => fetchDashboardData(dateRange.startDate, dateRange.endDate),
    {
      refetchOnWindowFocus: false,
    },
  )

  // Fetch faculty stats
  const { data: facultyData } = useQuery(["facultyStats"], () => fetchFacultyStats(), {
    refetchOnWindowFocus: false,
  })

  // Fetch program stats
  const { data: programData } = useQuery(["programStats"], () => fetchProgramStats(), {
    refetchOnWindowFocus: false,
  })

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on("newEvent", () => {
        // Refetch data when new events are received
        refetch()
      })

      // Join analytics room
      socket.emit("joinAnalytics")

      return () => {
        socket.off("newEvent")
      }
    }
  }, [socket, refetch])

  // Handle date range change
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate })
  }

  // Handle export
  const handleExport = () => {
    if (data) {
      exportToExcel(
        [
          {
            sheetName: "Overview",
            data: [
              {
                totalPageViews: data.pageViews.totalPageViews,
                totalEvents: data.eventFrequency.totalEvents,
                totalStudents: data.userEngagement.totalUsers,
                totalTimeSpent: data.timeSpent.totalTimeSpentMinutes,
              },
            ],
          },
          {
            sheetName: "Page Views",
            data: data.pageViews.pageViewsByPath,
          },
          {
            sheetName: "Event Frequency",
            data: data.eventFrequency.eventFrequency,
          },
          {
            sheetName: "Student Engagement",
            data: data.userEngagement.userEngagement,
          },
        ],
        `CUT_Analytics_Dashboard_${new Date().toISOString().split("T")[0]}`,
      )
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return <ErrorDisplay error={error as Error} />
  }

  return (
    <div className="flex flex-col h-full">
      <Header onExport={handleExport} />

      <div className="p-6 bg-gray-50 dark:bg-gray-900 flex-1 overflow-y-auto transition-colors duration-200">
        <DashboardHeader />

        <div className="mb-6">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateRangeChange}
          />
        </div>

        <OverviewStats data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PageViewsChart data={data.pageViews} />
          <EventFrequencyChart data={data.eventFrequency} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TimeSpentChart data={data.timeSpent} />
          <ActivityHeatmap data={data.eventFrequency} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FacultyDistributionChart data={facultyData} />
          <StudentLevelDistribution data={programData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ModulePopularityChart data={data} />
          <StudentEngagementTable data={data.userEngagement} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

