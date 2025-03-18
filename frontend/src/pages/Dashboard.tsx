"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { DatePickerWithRange } from "../components/ui/date_range_picker"
import type { DateRange } from "react-day-picker"
import { Button } from "../components/ui/button"
import { Download, FileText, BarChart2, PieChart, Calendar } from "lucide-react"
import { exportToExcel, exportToPDF } from "../utils/exportUtils"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  const [activeTab, setActiveTab] = useState("overview")

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  // Handle export
  const handleExport = (format: "excel" | "pdf") => {
    const data = [
      { id: 1, name: "Sample Report Data", value: 100 },
      { id: 2, name: "More Report Data", value: 200 },
    ]

    if (format === "excel") {
      exportToExcel(
        [{ sheetName: "Report Data", data }],
        `CUT_Analytics_Report_${activeTab}_${new Date().toISOString().split("T")[0]}`,
      )
    } else if (format === "pdf") {
      exportToPDF(data, `CUT_Analytics_Report_${activeTab}_${new Date().toISOString().split("T")[0]}`)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Reports</h1>
          <p className="text-muted-foreground">Generate and export detailed reports on student activity</p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange value={dateRange} onChange={handleDateRangeChange} />
          <Button onClick={() => handleExport("excel")} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Excel
          </Button>
          <Button onClick={() => handleExport("pdf")} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <PieChart className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <Calendar className="h-4 w-4" />
            Modules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview Report</CardTitle>
              <CardDescription>Summary of all activity during the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This report provides a comprehensive overview of all activity on the CUT eLearning portal during the
                  selected time period. It includes metrics on page views, interactions, resource access, and time
                  spent.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Report Parameters</h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>Date Range:</strong> {dateRange.from?.toLocaleDateString()} to{" "}
                      {dateRange.to?.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Generated:</strong> {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Included Metrics</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Total page views and unique visitors</li>
                      <li>• Event distribution by type</li>
                      <li>• Activity timeline</li>
                      <li>• Top modules and resources</li>
                      <li>• Student engagement metrics</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleExport("excel")} className="gap-2">
                    <Download className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Report</CardTitle>
              <CardDescription>Detailed analysis of student engagement and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This report provides detailed insights into student engagement and performance on the CUT eLearning
                  portal. It includes metrics on individual student activity, resource access patterns, and comparative
                  analysis.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Report Parameters</h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>Date Range:</strong> {dateRange.from?.toLocaleDateString()} to{" "}
                      {dateRange.to?.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Generated:</strong> {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Included Metrics</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Student activity by faculty and program</li>
                      <li>• Top performing students</li>
                      <li>• Resource access patterns</li>
                      <li>• Time spent on platform</li>
                      <li>• Comparative analysis with peers</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleExport("excel")} className="gap-2">
                    <Download className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Report</CardTitle>
              <CardDescription>Analysis of module engagement and resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This report provides detailed insights into module engagement and resource utilization on the CUT
                  eLearning portal. It includes metrics on module popularity, resource access, and student interaction
                  patterns.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Report Parameters</h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>Date Range:</strong> {dateRange.from?.toLocaleDateString()} to{" "}
                      {dateRange.to?.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Generated:</strong> {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Included Metrics</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Module popularity ranking</li>
                      <li>• Resource access by type</li>
                      <li>• Student engagement per module</li>
                      <li>• Time spent on modules</li>
                      <li>• Module activity timeline</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleExport("excel")} className="gap-2">
                    <Download className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

