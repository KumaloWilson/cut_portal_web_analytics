"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"

interface DateRangePickerProps {
    startDate: Date
    endDate: Date
    onChange: (startDate: Date, endDate: Date) => void
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)

    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Predefined date ranges
    const dateRanges = [
        {
            label: "Today",
            getRange: () => {
                const today = new Date()
                return { start: today, end: today }
            },
        },
        {
            label: "Yesterday",
            getRange: () => {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                return { start: yesterday, end: yesterday }
            },
        },
        {
            label: "Last 7 Days",
            getRange: () => {
                const end = new Date()
                const start = new Date()
                start.setDate(start.getDate() - 6)
                return { start, end }
            },
        },
        {
            label: "Last 30 Days",
            getRange: () => {
                const end = new Date()
                const start = new Date()
                start.setDate(start.getDate() - 29)
                return { start, end }
            },
        },
        {
            label: "This Month",
            getRange: () => {
                const now = new Date()
                const start = new Date(now.getFullYear(), now.getMonth(), 1)
                const end = new Date()
                return { start, end }
            },
        },
        {
            label: "Last Month",
            getRange: () => {
                const now = new Date()
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                const end = new Date(now.getFullYear(), now.getMonth(), 0)
                return { start, end }
            },
        },
    ]

    // Handle range selection
    const handleRangeSelect = (range: { start: Date; end: Date }) => {
        onChange(range.start, range.end)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                    {formatDate(startDate)} - {formatDate(endDate)}
                </span>
                <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="p-2">
                        {dateRanges.map((range, index) => (
                            <button
                                key={index}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                                onClick={() => handleRangeSelect(range.getRange())}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 p-3">
                        <div className="text-xs font-medium text-gray-500 mb-2">Custom Range</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="start-date" className="block text-xs text-gray-500">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="start-date"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    value={startDate.toISOString().split("T")[0]}
                                    onChange={(e) => {
                                        const newStartDate = new Date(e.target.value)
                                        onChange(newStartDate, endDate)
                                    }}
                                />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-xs text-gray-500">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="end-date"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    value={endDate.toISOString().split("T")[0]}
                                    onChange={(e) => {
                                        const newEndDate = new Date(e.target.value)
                                        onChange(startDate, newEndDate)
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            className="mt-3 w-full bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded-md hover:bg-blue-700"
                            onClick={() => setIsOpen(false)}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DateRangePicker

