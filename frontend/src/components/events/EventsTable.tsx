import type React from "react"
import { formatDistanceToNow } from "date-fns"

interface EventsTableProps {
    events: any[]
}

const EventsTable: React.FC<EventsTableProps> = ({ events }) => {
    // Function to format event type for display
    const formatEventType = (eventType: string) => {
        return eventType
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    // Function to format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return {
            absolute: date.toLocaleString(),
            relative: formatDistanceToNow(date, { addSuffix: true }),
        }
    }

    // Function to render event details
    const renderEventDetails = (details: any) => {
        if (!details) return "No details"

        // Convert details object to string representation
        return Object.entries(details)
            .map(([key, value]) => {
                if (typeof value === "object") {
                    return `${key}: ${JSON.stringify(value)}`
                }
                return `${key}: ${value}`
            })
            .join(", ")
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event, index) => {
                        const timestamp = formatTimestamp(event.timestamp)

                        return (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.event_type === "page_view"
                                                ? "bg-blue-100 text-blue-800"
                                                : event.event_type === "button_click"
                                                    ? "bg-green-100 text-green-800"
                                                    : event.event_type === "form_submit"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {formatEventType(event.event_type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.user_id || "Anonymous"}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{event.url}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {renderEventDetails(event.details)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span title={timestamp.absolute}>{timestamp.relative}</span>
                                </td>
                            </tr>
                        )
                    })}

                    {events.length === 0 && (
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" colSpan={5}>
                                No events found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default EventsTable

