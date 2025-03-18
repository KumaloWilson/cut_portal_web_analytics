import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { ResponsiveBar } from "@nivo/bar"

interface ModulePopularityChartProps {
  data: any
}

const ModulePopularityChart: React.FC<ModulePopularityChartProps> = ({ data }) => {
  // Process data for bar chart
  const processDataForBarChart = () => {
    if (!data || !data.modulePopularity || !data.modulePopularity.modules) {
      return [{ module: "No Data", views: 0, resources: 0, exams: 0 }]
    }

    return data.modulePopularity.modules.slice(0, 10).map((module: any) => ({
      module: module.module_code || module.title.substring(0, 10),
      views: module.view_count || 0,
      resources: module.resource_access_count || 0,
      exams: module.exam_access_count || 0,
    }))
  }

  const barData = processDataForBarChart()

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>Module Popularity</CardTitle>
        <CardDescription>Top 10 most accessed modules</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveBar
            data={barData}
            keys={["views", "resources", "exams"]}
            indexBy="module"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
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
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Access Count",
              legendPosition: "middle",
              legendOffset: -40,
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
        </div>
      </CardContent>
    </Card>
  )
}

export default ModulePopularityChart

