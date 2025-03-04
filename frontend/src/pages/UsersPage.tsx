"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { useSocket } from "../contexts/SocketContext"
import { fetchDashboardData } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { User, Clock, BarChart2 } from "lucide-react"

const UsersPage: React.FC = () => {
    const socket = useSocket()
    const [searchTerm, setSearchTerm] = useState("")

    // Fetch user engagement data
    const { data, isLoading, isError, error, refetch } = useQuery(
        "userEngagement",
        () => fetchDashboardData(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
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

            return () => {
                socket.off("newEvent")
            }
        }
    }, [socket, refetch])

    // Handle search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (isError) {
        return <ErrorDisplay error={error as Error} />
    }

    // Filter users based on search term
    const filteredUsers = data.userEngagement.userEngagement.filter((user: any) =>
        user.userId.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">User Analytics</h1>

            <div className="mb-6">
                <div className="max-w-md">
                    <label htmlFor="search" className="sr-only">
                        Search users
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search users..."
                            type="search"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">User Engagement</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Detailed analytics for each user on the platform.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Events
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Page Views
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Interactions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time Spent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Activity
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user: any, index: number) => (
                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.totalEvents}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.eventCounts.page_view || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {(user.eventCounts.button_click || 0) + (user.eventCounts.form_submit || 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {/* Placeholder for time spent */}~{Math.round((user.totalEvents * 2.5) / 60)} min
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {/* Placeholder for last activity */}
                                        {new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No users found matching your search criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <User className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                            <p className="text-3xl font-bold">{data.userEngagement.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <BarChart2 className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Avg. Events per User</h3>
                            <p className="text-3xl font-bold">
                                {Math.round(data.eventFrequency.totalEvents / data.userEngagement.totalUsers)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Avg. Time per User</h3>
                            <p className="text-3xl font-bold">
                                {Math.round(data.timeSpent.totalTimeSpentMinutes / data.userEngagement.totalUsers)} min
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UsersPage

