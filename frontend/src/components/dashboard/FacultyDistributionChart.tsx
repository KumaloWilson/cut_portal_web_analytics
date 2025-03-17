import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsivePie } from "@nivo/pie"

interface FacultyDistributionChartProps {
  data: any
}

const FacultyDistributionChart: React.FC<FacultyDistributionChartProps> = ({ data }) => {
  // Process data for pie chart
  const processDataForPieChart = () => {
    if (!data || !data.faculties) {
      return [{ id: "No Data", label: "No Data", value: 1, color: "gray" }]
    }

    return data.faculties.map((faculty: any) => ({
      id: faculty.faculty_code,
      label: faculty.faculty_name,
      value: faculty.student_count,
      color: getColorForFaculty(faculty.faculty_code),
    }))
  }

  // Get a consistent color for each faculty
  const getColorForFaculty = (facultyCode: string) => {
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
    const hash = facultyCode.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)

    return colors[hash % colors.length]
  }

  const pieData = processDataForPieChart()

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>Faculty Distribution</CardTitle>
        <CardDescription>Student distribution across faculties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsivePie
            data={pieData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={{ from: "color", modifiers: [] }}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            defs={[
              {
                id: "dots",
                type: "patternDots",
                background: "inherit",
                color: "rgba(255, 255, 255, 0.3)",
                size: 4,
                padding: 1,
                stagger: true,
              },
              {
                id: "lines",
                type: "patternLines",
                background: "inherit",
                color: "rgba(255, 255, 255, 0.3)",
                rotation: -45,
                lineWidth: 6,
                spacing: 10,
              },
            ]}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
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
        </div>
      </CardContent>
    </Card>
  )
}

export default FacultyDistributionChart

