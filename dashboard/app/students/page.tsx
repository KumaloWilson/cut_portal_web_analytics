"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getStudents, getStudentEngagement } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { StudentDetailModal } from "@/components/student-detail-modal"
import { exportToCSV } from "@/lib/export"
import { Search, Filter, ArrowUpDown, ChevronRight, Download } from "lucide-react"
import type { Student, StudentEngagement } from "@/types"

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch students data
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await getStudents()
      return response
    },
  })

  // Fetch student engagement data
  const { data: studentEngagement, isLoading: isLoadingEngagement } = useQuery({
    queryKey: ["studentEngagement"],
    queryFn: async () => {
      const response = await getStudentEngagement()
      return response
    },
  })

  // Filter and sort students
  const filteredStudents = students?.filter((student: Student) => {
    const fullName = `${student.first_name} ${student.surname}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      student.student_id.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.programme_name.toLowerCase().includes(query)
    )
  })

  const sortedStudents = filteredStudents?.sort((a: Student, b: Student) => {
    if (sortBy === "name") {
      const nameA = `${a.first_name} ${a.surname}`.toLowerCase()
      const nameB = `${b.first_name} ${b.surname}`.toLowerCase()
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    } else if (sortBy === "id") {
      return sortOrder === "asc" ? a.student_id.localeCompare(b.student_id) : b.student_id.localeCompare(a.student_id)
    } else if (sortBy === "programme") {
      return sortOrder === "asc"
        ? a.programme_name.localeCompare(b.programme_name)
        : b.programme_name.localeCompare(a.programme_name)
    }
    return 0
  })

  // Toggle sort order
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  // Handle student click
  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student)
    setIsDetailModalOpen(true)
  }

  // Handle export
  const handleExportStudents = () => {
    if (students) {
      exportToCSV(students, "students", "students_list")
    }
  }

  const handleExportEngagement = () => {
    if (studentEngagement) {
      exportToCSV(studentEngagement, "students", "student_engagement")
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage and analyze student data</p>
        </div>
        <Button variant="outline" onClick={handleExportStudents}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="list" className="mb-6">
        <TabsList>
          <TabsTrigger value="list">Student List</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                  <div className="col-span-5 flex items-center cursor-pointer" onClick={() => toggleSort("name")}>
                    Student
                    {sortBy === "name" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center cursor-pointer" onClick={() => toggleSort("id")}>
                    ID
                    {sortBy === "id" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-4 flex items-center cursor-pointer" onClick={() => toggleSort("programme")}>
                    Programme
                    {sortBy === "programme" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {isLoadingStudents
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                        <div className="col-span-5 flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24 mt-1" />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="col-span-4">
                          <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="col-span-1 text-right">
                          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </div>
                      </div>
                    ))
                  : sortedStudents?.map((student: Student) => (
                      <motion.div
                        key={student.student_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleStudentClick(student)}
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-medium text-primary">
                              {student.first_name[0]}
                              {student.surname[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {student.first_name} {student.surname}
                            </p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm">{student.student_id}</div>
                        <div className="col-span-4 text-sm">{student.programme_name}</div>
                        <div className="col-span-1 text-right">
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Student Engagement</CardTitle>
                <CardDescription>Analyze student activity and engagement metrics</CardDescription>
              </div>
              <Button variant="outline" onClick={handleExportEngagement}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                  <div className="col-span-4">Student</div>
                  <div className="col-span-2 text-center">Sessions</div>
                  <div className="col-span-2 text-center">Time Spent</div>
                  <div className="col-span-2 text-center">Page Views</div>
                  <div className="col-span-2 text-center">Interactions</div>
                </div>
                {isLoadingEngagement
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                        <div className="col-span-4 flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24 mt-1" />
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </div>
                        <div className="col-span-2 text-center">
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                        <div className="col-span-2 text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </div>
                        <div className="col-span-2 text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </div>
                      </div>
                    ))
                  : studentEngagement?.map((student: StudentEngagement, index: number) => (
                      <motion.div
                        key={student.student_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          const fullStudent = students?.find((s) => s.student_id === student.student_id)
                          if (fullStudent) {
                            handleStudentClick(fullStudent)
                          }
                        }}
                      >
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-medium text-primary">
                              {student.first_name[0]}
                              {student.surname[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {student.first_name} {student.surname}
                            </p>
                            <p className="text-sm text-muted-foreground">{student.student_id}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{student.session_count}</span>
                            <span className="text-xs text-muted-foreground">sessions</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{Math.floor(student.total_time_spent / 60)}m</span>
                            <span className="text-xs text-muted-foreground">total time</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{Math.floor(student.event_count * 0.6)}</span>
                            <span className="text-xs text-muted-foreground">views</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{Math.floor(student.event_count * 0.4)}</span>
                            <span className="text-xs text-muted-foreground">interactions</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </DashboardLayout>
  )
}
