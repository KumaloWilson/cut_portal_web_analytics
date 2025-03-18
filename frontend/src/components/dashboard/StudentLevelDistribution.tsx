import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveBar } from "@nivo/bar"
import { Skeleton } from "@/components/ui/skeleton"

interface StudentLevelDistributionProps {
  data: any
  isLoading: boolean
}

export default function StudentLevelDistribution({ data, isLoading }: StudentLevelDistributionProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Levels</CardTitle>
          <CardDescription>Distribution by academic level</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  // Process data for the chart
  const chartData =
    data.levels?.map((level: any) => ({
      level: level.level,
      students: level.student_count,
    })) || []

  // If no data, show placeholder
  if (chartData.length === 0) {
    chartData.push({ level: "No Data", students: 0 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Levels</CardTitle>
        <CardDescription>Distribution by academic level</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveBar
          data={chartData}
          keys={["students"]}
          indexBy="level"
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "blues" }}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Level",
            legendPosition: "middle",
            legendOffset: 40,
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Students",
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

