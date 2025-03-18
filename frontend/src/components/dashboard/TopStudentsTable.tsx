import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"

interface TopStudentsTableProps {
  data: any
}

export default function TopStudentsTable({ data }: TopStudentsTableProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Students</CardTitle>
          <CardDescription>Students with highest engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <div className="ml-auto">
                    <Skeleton className="h-5 w-[60px]" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Students</CardTitle>
        <CardDescription>Students with highest engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.slice(0, 10).map((student: any, index: number) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={student.name} />
                <AvatarFallback>
                  {student.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "ST"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/students/${student.studentId}`} className="font-medium hover:underline">
                  {student.name || "Anonymous"}
                </Link>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{student.program || "Unknown Program"}</span>
                  {student.level && (
                    <Badge variant="outline" className="text-xs">
                      Level {student.level}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-medium">{student.totalEvents.toLocaleString()} events</div>
                <div className="text-sm text-muted-foreground">
                  {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : "Never"}
                </div>
              </div>
            </div>
          ))}

          {data.length === 0 && <div className="text-center py-6 text-muted-foreground">No student data available</div>}
        </div>
      </CardContent>
    </Card>
  )
}

