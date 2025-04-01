"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart } from "@/components/ui/chart"
import { motion } from "framer-motion"
import { Calendar, TrendingUp, TrendingDown, Users } from "lucide-react"

interface VisitorsOverviewProps {
  dailyVisitors: number
  visitorTrend: number
  isLoading: boolean
  activityData: { date: string; sessions: number }[]
}

export function VisitorsOverview({ dailyVisitors, visitorTrend, isLoading, activityData }: VisitorsOverviewProps) {
  const chartData = activityData.map((item) => ({
    date: item.date,
    visitors: item.sessions,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center">
          <Users className="mr-2 h-5 w-5 text-muted-foreground" />
          Daily Visitor Tracking
        </CardTitle>
        <CardDescription>Monitor visitor trends over the last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">Today's Visitors</div>
                <div className="flex items-center text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  Today
                </div>
              </div>

              {isLoading ? (
                <Skeleton className="h-9 w-20 mt-1" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="text-3xl font-bold"
                  >
                    {dailyVisitors}
                  </motion.div>
                  <div
                    className={`text-xs px-1 py-0.5 rounded ${
                      visitorTrend >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span className="flex items-center">
                      {visitorTrend >= 0 ? (
                        <TrendingUp className="mr-0.5 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-0.5 h-3 w-3" />
                      )}
                      {Math.abs(visitorTrend).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">vs previous day</div>

              <div className="mt-6 space-y-1.5">
                <div className="flex items-center text-sm">
                  <div className="h-3 w-3 rounded-full bg-primary mr-2"></div>
                  <div className="font-medium">Total visitors</div>
                  <div className="ml-auto">{activityData.reduce((sum, item) => sum + item.sessions, 0)}</div>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  <div className="font-medium">Average daily</div>
                  <div className="ml-auto">
                    {Math.round(
                      activityData.reduce((sum, item) => sum + item.sessions, 0) / (activityData.length || 1),
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="font-medium">Peak day</div>
                  <div className="ml-auto">
                    {activityData.length ? Math.max(...activityData.map((item) => item.sessions)) : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {isLoading ? (
              <Skeleton className="h-[180px] w-full" />
            ) : (
              <LineChart
                data={chartData}
                categories={["visitors"]}
                index="date"
                colors={["primary"]}
                valueFormatter={(value) => value.toString()}
                className="h-[180px]"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

