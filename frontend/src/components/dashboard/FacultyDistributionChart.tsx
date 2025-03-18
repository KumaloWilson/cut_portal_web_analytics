import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsivePie } from "@nivo/pie"
import { Skeleton } from "@/components/ui/skeleton"

interface FacultyDistributionChartProps {
  data: any
  isLoading: boolean
}

export default function FacultyDistributionChart({ data, isLoading }: FacultyDistributionChartProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faculty Distribution</CardTitle>
          <CardDescription>Students by faculty</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  // Process data for the chart
  const chartData =
    data.faculties?.map((faculty: any) => ({
      id: faculty.faculty_code,
      label: faculty.faculty_name,
      value: faculty.student_count,
    })) || []

  // If no data, show placeholder
  if (chartData.length === 0) {
    chartData.push({ id: "No Data", label: "No Data", value: 1 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty Distribution</CardTitle>
        <CardDescription>Students by faculty</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsivePie
          data={chartData}
          margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.2]],
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: "color",
            modifiers: [["darker", 2]],
          }}
          colors={{ scheme: "nivo" }}
          legends={[
            {
              anchor: "right",
              direction: "column",
              justify: false,
              translateX: 70,
              translateY: 0,
              itemsSpacing: 5,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
            },
          ]}
        />
      </CardContent>
    </Card>
  )
}

