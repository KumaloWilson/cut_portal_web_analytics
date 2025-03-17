import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveBar } from "@nivo/bar"

interface StudentLevelDistributionProps {
  data: any
}

const StudentLevelDistribution: React.FC<StudentLevelDistributionProps> = ({ data }) => {
  // Process data for bar chart
  const processDataForBarChart = () => {
    if (!data || !data.levels) {
      return [{ level: "No Data", count: 0 }]
    }

    return data.levels.map((level: any) => ({
      level: level.level,
      count: level.student_count,
      color: getColorForLevel(level.level),
    }))
  }

  // Get a consistent color for each level
  const getColorForLevel = (level: string) => {
    const colors = [
      "#0077b6",
      "#00b4d8",
      "#90e0ef",
      "#48cae4",
      "#ade8f4",
      "#023e8a",
      "#0096c7",
      "#caf0f8",
      "#03045e",
      "#0077b6",
    ]

    // Simple hash function to get a consistent index
    const hash = level.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)

    return colors[hash % colors.length]
  }

  const barData = processDataForBarChart()

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>Student Level Distribution</CardTitle>
        <CardDescription>Student distribution across academic levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveBar
            data={barData}
            keys={["count"]}
            indexBy="level"
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={({ data }: { data: { color: string } }) => data.color}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Level",
              legendPosition: "middle",
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Student Count",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                        animate={true}
            motionConfig="elastic"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default StudentLevelDistribution

