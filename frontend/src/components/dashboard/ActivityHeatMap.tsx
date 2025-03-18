import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveHeatMap } from "@nivo/heatmap"
import { Skeleton } from "../../components/ui/skeleton"

interface ActivityHeatmapProps {
  data: any
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>Activity by day and hour</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  // Process data for the heatmap
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))

  const heatmapData = daysOfWeek.map((day) => {
    const dayData: any = { day }
    hoursOfDay.forEach((hour) => {
      const hourKey = `${day}-${hour}`
      dayData[hour] = data[hourKey] || 0
    })
    return dayData
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Activity by day and hour</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveHeatMap
          data={heatmapData}
          key="heatmap"
          margin={{ top: 20, right: 60, bottom: 60, left: 60 }}
          forceSquare={false}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -90,
            legend: "Hour of Day",
            legendPosition: "middle",
            legendOffset: 46,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Day of Week",
            legendPosition: "middle",
            legendOffset: -40,
            truncateTickAt: 0,
          }}
          opacity={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
          colors={{
            type: 'sequential',
            colors: ["#caf0f8", "#0077b6"]
          }}
          animate={true}
            motionConfig="elastic"
          hoverTarget="cell"
          theme={{
            tooltip: {
              container: {
                background: "white",
                color: "black",
                fontSize: 12,
                borderRadius: 4,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "8px 12px",
              },
            },
          }}
        />
      </CardContent>
    </Card>
  )
}

