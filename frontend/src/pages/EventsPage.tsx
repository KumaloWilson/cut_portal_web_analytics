"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { fetchEvents } from "../services/api"
import EventsTable from "../components/events/EventsTable"
import EventsFilter from "../components/events/EventsFilter"
import Pagination from "../components/common/Pagination"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { useSocket } from "../contexts/SocketContext"

const EventsPage: React.FC = () => {
    const socket = useSocket()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(50)
    const [filters, setFilters] = useState({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(),
        eventType: "",
        userId: "",
    })

    // Fetch events data
    const { data, isLoading, isError, error, refetch } = useQuery(
        ["events", page, limit, filters],
        () => fetchEvents(page, limit, filters),
        {
            keepPreviousData: true,
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

            return () => {
                socket.off("newEvent")
            }
        }
    }, [socket, refetch])

    // Handle filter change
    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters)
        setPage(1) // Reset to first page when filters change
    }

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    // Handle limit change
    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit)
        setPage(1) // Reset to first page when limit changes
    }

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (isError) {
        return <ErrorDisplay error={error as Error} />
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Event Logs</h1>

            <EventsFilter filters={filters} onFilterChange={handleFilterChange} />

            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                <EventsTable events={data.events} />

                <div className="p-4 border-t">
                    <Pagination
                        currentPage={page}
                        totalPages={data.totalPages}
                        onPageChange={handlePageChange}
                        limit={limit}
                        onLimitChange={handleLimitChange}
                        totalItems={data.total}
                    />
                </div>
            </div>
        </div>
    )
}

export default EventsPage

