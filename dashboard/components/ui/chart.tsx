"use client"

import type * as React from "react"
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn("h-80 w-full", className)}
      style={
        {
          "--color-primary": "hsl(var(--chart-1))",
          "--color-secondary": "hsl(var(--chart-2))",
          "--color-tertiary": "hsl(var(--chart-3))",
          "--color-quaternary": "hsl(var(--chart-4))",
          "--color-quinary": "hsl(var(--chart-5))",
          ...Object.entries(config).reduce(
            (acc, [key, value]) => {
              acc[`--color-${key}`] = value.color
              return acc
            },
            {} as Record<string, string>,
          ),
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps extends React.ComponentProps<typeof Tooltip> {
  content?: React.ReactNode
}

export function ChartTooltip({ content = <ChartTooltipContent />, ...props }: ChartTooltipProps) {
  return <Tooltip content={content} {...props} />
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: string | number
    color: string
  }>
  label?: string
}

export function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col gap-1">
            {payload.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[0.70rem] text-muted-foreground">{item.name}</span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

interface AreaChartProps {
  data: any[]
  categories: string[]
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function AreaChart({
  data,
  categories,
  index,
  colors = ["blue", "green", "amber"],
  valueFormatter = (value) => value.toString(),
  className,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {categories.map((category, i) => (
            <linearGradient key={category} id={`color-${category}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${colors[i % colors.length]})`} stopOpacity={0.8} />
              <stop offset="95%" stopColor={`var(--color-${colors[i % colors.length]})`} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          dataKey={index}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickFormatter={valueFormatter}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <ChartTooltip />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stroke={`var(--color-${colors[i % colors.length]})`}
            fillOpacity={1}
            fill={`url(#color-${category})`}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: any[]
  categories: string[]
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function BarChart({
  data,
  categories,
  index,
  colors = ["blue", "green", "amber"],
  valueFormatter = (value) => value.toString(),
  className,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis
          dataKey={index}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickFormatter={valueFormatter}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <ChartTooltip />
        <Legend />
        {categories.map((category, i) => (
          <Bar key={category} dataKey={category} fill={`var(--color-${colors[i % colors.length]})`} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

interface LineChartProps {
  data: any[]
  categories: string[]
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function LineChart({
  data,
  categories,
  index,
  colors = ["blue", "green", "amber"],
  valueFormatter = (value) => value.toString(),
  className,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis
          dataKey={index}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickFormatter={valueFormatter}
        />
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <ChartTooltip />
        <Legend />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={`var(--color-${colors[i % colors.length]})`}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

interface PieChartProps {
  data: any[]
  category: string
  index: string
  colors?: string[]
  className?: string
}

export function PieChart({
  data,
  category,
  index,
  colors = ["blue", "green", "amber", "purple", "pink"],
  className,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={`var(--color-${colors[i % colors.length]})`} />
          ))}
        </Pie>
        <ChartTooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
