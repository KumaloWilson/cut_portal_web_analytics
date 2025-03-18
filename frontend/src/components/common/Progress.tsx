import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Progress as ProgressBar } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { LineChart, XAxis, YAxis, Line } from "recharts"


interface ProgressMetric {
  name: string
  value: number
  target: number
  unit: string
  trend: "up" | "down" | "stable"
  history: {
    date: string
    value: number
  }[]
}

interface ProgressProps {
  title: string
  description?: string
  metrics: ProgressMetric[]
}

const Progress: React.FC<ProgressProps> = ({ title, description, metrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const percentage = Math.min(Math.round((metric.value / metric.target) * 100), 100)

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">
                        {metric.value} <span className="text-sm text-muted-foreground">{metric.unit}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        of {metric.target} {metric.unit}
                      </span>
                      <Badge
                        variant={
                          metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "outline"
                        }
                        className="ml-2"
                      >
                        {metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"}{" "}
                        {metric.trend.charAt(0).toUpperCase() + metric.trend.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xl font-bold">{percentage}%</span>
                </div>

                <ProgressBar value={percentage} className="h-2" />

                <Tabs defaultValue="chart" className="w-full">
                  <TabsList className="grid w-full max-w-[200px] grid-cols-2">
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chart" className="space-y-4">
                    <div className="h-[200px] mt-4">
                      <LineChart
                        data={metric.history}
                        width={500}
                        height={200}
                      >
                        <XAxis dataKey="date" />
                        <YAxis width={48} />
                        <Line type="monotone" dataKey="value" stroke="#2563eb" />
                      </LineChart>
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="space-y-4">
                    <div className="mt-4 max-h-[200px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Date</th>
                            <th className="text-right py-2">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metric.history.map((item, i) => (
                            <tr key={i} className="border-b border-muted">
                              <td className="py-2">{item.date}</td>
                              <td className="text-right py-2">
                                {item.value} {metric.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default Progress

