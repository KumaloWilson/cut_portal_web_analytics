import type React from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

interface TimeSpentChartProps {
    data: any
}

const TimeSpentChart: React.FC<TimeSpentChartProps> = ({ data }) => {
    // Get top 5 pages by time spent
    const topPages = data.timeSpentByPath.slice(0, 5)

    // Calculate "Other" category for remaining pages
    const otherTimeSpent = data.timeSpentByPath.slice(5).reduce((total: number, page: any) => total + page.timeSpent, 0)

    // Prepare chart data
    const chartData = {
        labels: [
            ...topPages.map((page: any) => {
                const path = page.path
                return path.length > 20 ? path.substring(0, 20) + "..." : path
            }),
            otherTimeSpent > 0 ? "Other" : null,
        ].filter(Boolean),
        datasets: [
            {
                data: [
                    ...topPages.map((page: any) => page.timeSpentMinutes),
                    otherTimeSpent > 0 ? Math.round((otherTimeSpent / 60000) * 10) / 10 : null,
                ].filter(Boolean),
                backgroundColor: [
                    "rgba(74, 109, 167, 0.7)",
                    "rgba(45, 149, 150, 0.7)",
                    "rgba(149, 82, 81, 0.7)",
                    "rgba(184, 134, 11, 0.7)",
                    "rgba(85, 107, 47, 0.7)",
                    "rgba(128, 128, 128, 0.7)",
                ],
                borderColor: [
                    "rgba(74, 109, 167, 1)",
                    "rgba(45, 149, 150, 1)",
                    "rgba(149, 82, 81, 1)",
                    "rgba(184, 134, 11, 1)",
                    "rgba(85, 107, 47, 1)",
                    "rgba(128, 128, 128, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }

    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right" as const,
            },
            title: {
                display: true,
                text: "Time Spent by Page (minutes)",
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.label || ""
                        const value = context.raw || 0
                        return `${label}: ${value} min`
                    },
                },
            },
        },
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-80">
                <Pie data={chartData} options={options} />
            </div>
        </div>
    )
}

export default TimeSpentChart

