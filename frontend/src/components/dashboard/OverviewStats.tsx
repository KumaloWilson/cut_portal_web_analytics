import type React from "react"
import { Eye, MousePointer, FileText, Clock } from "lucide-react"

interface OverviewStatsProps {
    data: any
}

const OverviewStats: React.FC<OverviewStatsProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
                title="Total Page Views"
                value={data.pageViews.totalPageViews}
                icon={<Eye className="h-6 w-6 text-blue-500" />}
                description="Total number of page views"
            />

            <StatCard
                title="Button Clicks"
                value={data.userEngagement.totalEvents}
                icon={<MousePointer className="h-6 w-6 text-green-500" />}
                description="Total number of interactions"
            />

            <StatCard
                title="Form Submissions"
                value={data.eventFrequency.totalEvents}
                icon={<FileText className="h-6 w-6 text-purple-500" />}
                description="Total number of events recorded"
            />

            <StatCard
                title="Time Spent"
                value={`${data.timeSpent.totalTimeSpentMinutes} min`}
                icon={<Clock className="h-6 w-6 text-orange-500" />}
                description="Total time spent on the portal"
            />
        </div>
    )
}

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    description: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">{title}</h3>
                {icon}
            </div>
            <div className="text-3xl font-bold mb-2">{value}</div>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    )
}

export default OverviewStats

