import type React from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface PageViewsChartProps {
  data: any
}

const PageViewsChart: React.FC<PageViewsChartProps> = ({ data }) => {
  // Get top 10 pages by views
  const topPages = data.pageViewsByPath.slice(0, 10)

  // Prepare chart data
  const chartData = {
    labels: topPages.map((page: any) => {
      // Shorten path for display
      const path = page.path
      return path.length > 20 ? path.substring(0, 20) + "..." : path
    }),
    datasets: [
      {
        label: "Page Views",
        data: topPages.map((page: any) => page.count),
        backgroundColor: "rgba(74, 109, 167, 0.7)",
        borderColor: "rgba(74, 109, 167, 1)",
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
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Top Pages by Views",
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex
            return topPages[index].path
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Views",
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export default PageViewsChart

