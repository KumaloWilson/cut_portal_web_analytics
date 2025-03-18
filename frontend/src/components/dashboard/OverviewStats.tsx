import { Card, CardContent } from "@/components/ui/card"
import { Eye, MousePointer, Clock, FileText } from "lucide-react"

interface OverviewStatsProps {
  data: any
}

export default function OverviewStats({ data }: OverviewStatsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {i === 0 && <Eye className="h-5 w-5 text-primary" />}
                    {i === 1 && <MousePointer className="h-5 w-5 text-primary" />}
                    {i === 2 && <FileText className="h-5 w-5 text-primary" />}
                    {i === 3 && <Clock className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Loading...</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Page Views</p>
              <p className="text-2xl font-bold">{data.totalPageViews?.toLocaleString() || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <MousePointer className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interactions</p>
              <p className="text-2xl font-bold">{data.totalInteractions?.toLocaleString() || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resources</p>
              <p className="text-2xl font-bold">{data.totalResources?.toLocaleString() || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
              <p className="text-2xl font-bold">{data.avgTimeSpent || 0} min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

