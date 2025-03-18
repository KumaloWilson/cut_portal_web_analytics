import type React from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface EventFrequencyChartProps {
  data: any
}

const EventFrequencyChart: React.FC<EventFrequencyChartProps> = ({ data }) => {
  // Prepare chart data
  const chartData = {
    labels: data.eventFrequency.map((item: any) => item.interval),
    datasets: [
      {
        label: "Event Frequency",
        data: data.eventFrequency.map((item: any) => item.count),
        fill: false,
        backgroundColor: "rgba(74, 109, 167, 0.7)",
        borderColor: "rgba(74, 109, 167, 1)",
        tension: 0.4,
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
        text: "Event Frequency Over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Events",
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

export default EventFrequencyChart

