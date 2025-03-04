"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { fetchDashboardData } from "../services/api"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import OverviewStats from "../components/dashboard/OverviewStats"
import PageViewsChart from "../components/dashboard/PageViewsChart"
import EventFrequencyChart from "../components/dashboard/EventFrequencyChart"
import UserEngagementTable from "../components/dashboard/UserEngagementTable"
import TimeSpentChart from "../components/dashboard/TimeSpentChart"
import DateRangePicker from "../components/common/DateRangePicker"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { useSocket } from "../contexts/SocketContext"

const Dashboard: React.FC = () => {
    const socket = useSocket()
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
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

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (isError) {
        return <ErrorDisplay error={error as Error} />
    }

    return (
        <div className="p-6">
            <DashboardHeader />

            <div className="mb-6">
                <DateRangePicker startDate={dateRange.startDate} endDate={dateRange.endDate} onChange={handleDateRangeChange} />
            </div>

            <OverviewStats data={data} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <PageViewsChart data={data.pageViews} />
                <EventFrequencyChart data={data.eventFrequency} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeSpentChart data={data.timeSpent} />
                <UserEngagementTable data={data.userEngagement} />
            </div>
        </div>
    )
}

export default Dashboard

