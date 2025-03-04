"use client"

import type React from "react"
import { useState } from "react"
import { Filter, X } from "lucide-react"
import { EventType } from "../../types/events"

interface EventsFilterProps {
    filters: {
        startDate: Date
        endDate: Date
        eventType: string
        userId: string
    }
    onFilterChange: (filters: any) => void
}

const EventsFilter: React.FC<EventsFilterProps> = ({ filters, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [localFilters, setLocalFilters] = useState({
        startDate: filters.startDate,
        endDate: filters.endDate,
        eventType: filters.eventType,
        userId: filters.userId,
    })

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        if (name === "startDate" || name === "endDate") {
            setLocalFilters({
                ...localFilters,
                [name]: new Date(value),
            })
        } else {
            setLocalFilters({
                ...localFilters,
                [name]: value,
            })
        }
    }

    // Apply filters
    const applyFilters = () => {
        onFilterChange(localFilters)
        setIsOpen(false)
    }

    // Reset filters
    const resetFilters = () => {
        const defaultFilters = {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            endDate: new Date(),
            eventType: "",
            userId: "",
        }

        setLocalFilters(defaultFilters)
        onFilterChange(defaultFilters)
        setIsOpen(false)
    }

    // Format date for input
    const formatDateForInput = (date: Date): string => {
        return date.toISOString().split("T")[0]
    }

    // Check if any filters are active
    const hasActiveFilters = (): boolean => {
        return filters.eventType !== "" || filters.userId !== ""
    }

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                <button
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Filter</span>
                    {hasActiveFilters() && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Active
                        </span>
                    )}
                </button>

                {hasActiveFilters() && (
                    <button className="text-sm text-gray-500 hover:text-gray-700" onClick={resetFilters}>
                        Clear filters
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="mt-3 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Filter Events</h3>
                        <button className="text-gray-400 hover:text-gray-500" onClick={() => setIsOpen(false)}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                value={formatDateForInput(localFilters.startDate)}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                value={formatDateForInput(localFilters.endDate)}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                                Event Type
                            </label>
                            <select
                                id="eventType"
                                name="eventType"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                value={localFilters.eventType}
                                onChange={handleChange}
                            >
                                <option value="">All Event Types</option>
                                {Object.values(EventType).map((type) => (
                                    <option key={type} value={type}>
                                        {type
                                            .split("_")
                                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                                User ID
                            </label>
                            <input
                                type="text"
                                id="userId"
                                name="userId"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                                placeholder="Filter by user ID"
                                value={localFilters.userId}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            onClick={applyFilters}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EventsFilter

