import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveBar } from "@nivo/bar"
import { Skeleton } from "@/components/ui/skeleton"

interface ResourceAccessChartProps {
  data: any
}

export default function ResourceAccessChart({ data }: ResourceAccessChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Access</CardTitle>
          <CardDescription>Most accessed resource types</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  // Process data for the chart
  const chartData = Object.entries(data).map(([key, value]) => ({
    type: key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    count: value as number,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Access</CardTitle>
        <CardDescription>Most accessed resource types</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveBar
          data={chartData}
          keys={["count"]}
          indexBy="type"
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "purples" }}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Resource Type",
            legendPosition: "middle",
            legendOffset: 40,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Access Count",
            legendOffset: -50,
            legendPosition: "middle",
            truncateTickAt: 0,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
         animate={true}
            motionConfig="elastic"
        />
      </CardContent>
    </Card>
  )
}

