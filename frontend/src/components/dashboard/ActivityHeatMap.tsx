"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"
import { subDays, format, startOfWeek, addDays } from "date-fns"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Tooltip } from "react-tooltip"

interface ActivityHeatmapProps {
  data: any
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month")

  // Process data for heatmap
  const processDataForHeatmap = () => {
    const today = new Date()
    let startDate

    switch (timeRange) {
      case "week":
        startDate = subDays(today, 7)
        break
      case "month":
        startDate = subDays(today, 30)
        break
      case "quarter":
        startDate = subDays(today, 90)
        break
      case "year":
        startDate = subDays(today, 365)
        break
      default:
        startDate = subDays(today, 30)
    }

    // Create a map of dates to event counts
    const dateMap: Record<string, number> = {}

    // Initialize all dates in range with 0
    let currentDate = new Date(startDate)
    while (currentDate <= today) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      dateMap[dateStr] = 0
      currentDate = addDays(currentDate, 1)
    }

    // Populate with actual data if available
    if (data && data.eventFrequency) {
      data.eventFrequency.forEach((event: any) => {
        try {
          const date = new Date(event.interval)
          const dateStr = format(date, "yyyy-MM-dd")

          if (dateStr in dateMap) {
            dateMap[dateStr] += event.count
          }
        } catch (error) {
          console.error("Error processing event for heatmap:", error)
        }
      })
    }

    // Convert to format needed by react-calendar-heatmap
    return Object.entries(dateMap).map(([date, count]) => ({
      date,
      count,
    }))
  }

  const getTooltipDataAttrs = (value: { date: string; count?: number }) => {
    const tooltipAttributes = {
      "data-tooltip-id": "heatmap-tooltip",
      "data-tooltip-content": !value || !value.count ? "No activity" : `${value.date}: ${value.count} events`
    }
    return tooltipAttributes
  }

  const getClassForValue = (value: any) => {
    if (!value || !value.count) {
      return "color-empty"
    }

    if (value.count < 5) {
      return "color-scale-1"
    } else if (value.count < 10) {
      return "color-scale-2"
    } else if (value.count < 20) {
      return "color-scale-3"
    } else {
      return "color-scale-4"
    }
  }

  const heatmapData = processDataForHeatmap()
  const today = new Date()

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Activity Heatmap</CardTitle>
            <CardDescription>Student activity over time</CardDescription>
          </div>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-full">
          <CalendarHeatmap
            startDate={
              timeRange === "week"
                ? startOfWeek(subDays(today, 7))
                : timeRange === "month"
                  ? subDays(today, 30)
                  : timeRange === "quarter"
                    ? subDays(today, 90)
                    : subDays(today, 365)
            }
            endDate={today}
            values={heatmapData}
            classForValue={getClassForValue}
            // tooltipDataAttrs={getTooltipDataAttrs}
            showWeekdayLabels={true}
            horizontal={true}
          />
          <Tooltip id="heatmap-tooltip" />

          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700"></div>
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900"></div>
              <div className="w-4 h-4 bg-blue-300 dark:bg-blue-700"></div>
              <div className="w-4 h-4 bg-blue-500 dark:bg-blue-500"></div>
              <div className="w-4 h-4 bg-blue-700 dark:bg-blue-300"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
            </div>
          </div>
        </div>
      </CardContent>
      <style>
        {`
        .react-calendar-heatmap .color-empty {
          fill: var(--color-empty, #ebedf0);
        }
        .dark .react-calendar-heatmap .color-empty {
          fill: var(--color-empty-dark, #2d3748);
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: var(--color-scale-1, #caf0f8);
        }
        .dark .react-calendar-heatmap .color-scale-1 {
          fill: var(--color-scale-1-dark, #0d4a6f);
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: var(--color-scale-2, #90e0ef);
        }
        .dark .react-calendar-heatmap .color-scale-2 {
          fill: var(--color-scale-2-dark, #0369a1);
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: var(--color-scale-3, #48cae4);
        }
        .dark .react-calendar-heatmap .color-scale-3 {
          fill: var(--color-scale-3-dark, #0284c7);
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: var(--color-scale-4, #0077b6);
        }
        .dark .react-calendar-heatmap .color-scale-4 {
          fill: var(--color-scale-4-dark, #38bdf8);
        }
        .react-calendar-heatmap text {
          fill: #aaa;
          font-size: 10px;
        }
        .dark .react-calendar-heatmap text {
          fill: #718096;
        }
        `}
      </style>
    </Card>
  )
}

export default ActivityHeatmap

