import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { ResponsiveLine } from "@nivo/line"
import { Skeleton } from "../../components/ui/skeleton"

interface ActivityTimelineProps {
  data: any
}

export default function ActivityTimeline({ data }: ActivityTimelineProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Student activity over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  // Process data for the chart
  const chartData = [
    {
      id: "Activity",
      data: data.map((item: any) => ({
        x: item.date,
        y: item.count,
      })),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>Student activity over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Date",
            legendOffset: 40,
            legendPosition: "middle",
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Count",
            legendOffset: -40,
            legendPosition: "middle",
            truncateTickAt: 0,
          }}
          enableGridX={false}
          colors={{ scheme: "category10" }}
          lineWidth={3}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          enableArea={true}
          
          areaOpacity={0.1}
          legends={[]}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 11,
                  fill: "#777777",
                },
              },
              legend: {
                text: {
                  fontSize: 12,
                  fill: "#777777",
                },
              },
            },
            grid: {
              line: {
                stroke: "#dddddd",
                strokeWidth: 1,
              },
            },
            tooltip: {
              container: {
                background: "#ffffff",
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

