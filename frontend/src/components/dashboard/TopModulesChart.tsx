import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveBar } from "@nivo/bar"
import { Skeleton } from "@/components/ui/skeleton"

interface TopModulesChartProps {
  data: any
}

export default function TopModulesChart({ data }: TopModulesChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Modules</CardTitle>
          <CardDescription>Most active modules by engagement</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  // Process data for the chart
  const chartData = data.slice(0, 10).map((module: any) => ({
    module: module.moduleCode || module.title.substring(0, 10),
    views: module.views || 0,
    resources: module.resources || 0,
    exams: module.exams || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Modules</CardTitle>
        <CardDescription>Most active modules by engagement</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveBar
          data={chartData}
          keys={["views", "resources", "exams"]}
          indexBy="module"
          margin={{ top: 20, right: 130, bottom: 50, left: 50 }}
          padding={0.3}
          groupMode="grouped"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={["#0077b6", "#00b4d8", "#90e0ef"]}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "Module",
            legendPosition: "middle",
            legendOffset: 40,
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
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          animate={true}
            motionConfig="elastic"
        />
      </CardContent>
    </Card>
  )
}

