"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { LoadingSpinner } from "../components/common/LoadingSpinner"
import { ErrorDisplay } from "../components/common/ErrorDisplay"
import { DateRangePicker } from "../components/common/DateRangePicker"
import { BarChart, PieChart } from "../components/ui/chart"
import { fetchFacultyStats, fetchProgramStats } from "../services/api"
import { exportToExcel, exportToCsv, exportToPdf } from "../utils/exportUtils"
import { Download, Users, BookOpen, GraduationCap } from "lucide-react"

const FacultiesPage: React.FC = () => {
  const [facultyStats, setFacultyStats] = useState<any[]>([])
  const [programStats, setProgramStats] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch faculty stats
        const facultyData = await fetchFacultyStats()
        setFacultyStats(facultyData)

        // Fetch program stats
        const programData = await fetchProgramStats()
        setProgramStats(programData)

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch faculty data")
        setLoading(false)
        console.error(err)
      }
    }

    fetchData()
  }, [])

  const handleExport = (type: "excel" | "csv" | "pdf") => {
    const data = facultyStats.map((faculty) => ({
      "Faculty Code": faculty.facultyCode,
      "Faculty Name": faculty.name,
      Students: faculty.studentCount,
      Modules: faculty.moduleCount,
      Programs: faculty.programCount,
      "Activity Level": faculty.activityLevel,
    }))

    const fileName = "faculties-report"

    if (type === "excel") {
      exportToExcel(data, fileName)
    } else if (type === "csv") {
      exportToCsv(data, fileName)
    } else if (type === "pdf") {
      exportToPdf(data, fileName, "Faculties Report")
    }
  }

  // Filter programs by selected faculty
  const filteredPrograms = selectedFaculty
    ? programStats.filter((program) => program.facultyCode === selectedFaculty)
    : programStats

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <ErrorDisplay message={error} />
      </div>
    )
  }

  const renderOverview = () => {
    // Prepare data for faculty student distribution chart
    const facultyStudentData = facultyStats.map((faculty) => ({
      name: faculty.facultyCode,
      value: faculty.studentCount,
    }))

    // Prepare data for faculty module distribution chart
    const facultyModuleData = facultyStats.map((faculty) => ({
      name: faculty.facultyCode,
      value: faculty.moduleCount,
    }))

    // Prepare data for faculty activity level chart
    const activityData = [
      { name: "High", value: facultyStats.filter((f) => f.activityLevel === "High").length },
      { name: "Medium", value: facultyStats.filter((f) => f.activityLevel === "Medium").length },
      { name: "Low", value: facultyStats.filter((f) => f.activityLevel === "Low").length },
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Faculties</p>
                <h3 className="text-2xl font-bold mt-1">{facultyStats.length}</h3>
              </div>
              <GraduationCap className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Programs</p>
                <h3 className="text-2xl font-bold mt-1">{programStats.length}</h3>
              </div>
              <BookOpen className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <h3 className="text-2xl font-bold mt-1">
                  {facultyStats.reduce((sum, faculty) => sum + faculty.studentCount, 0)}
                </h3>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Students by Faculty</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                data={facultyStudentData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value} students`}
                yAxisWidth={60}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Modules by Faculty</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                data={facultyModuleData}
                index="name"
                categories={["value"]}
                colors={["green"]}
                valueFormatter={(value) => `${value} modules`}
                yAxisWidth={60}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Faculty Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex justify-center items-center">
            <div className="w-full h-full max-w-xs">
              <PieChart
                data={activityData}
                index="name"
                categories={["value"]}
                colors={["blue", "green", "yellow"]}
                valueFormatter={(value) => `${value} faculties`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderFaculties = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faculty List</CardTitle>
          <CardDescription>All faculties in the CUT eLearning system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty Code</TableHead>
                <TableHead>Faculty Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Programs</TableHead>
                <TableHead>Activity Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facultyStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No faculties found
                  </TableCell>
                </TableRow>
              ) : (
                facultyStats.map((faculty) => (
                  <TableRow key={faculty.facultyCode}>
                    <TableCell>{faculty.facultyCode}</TableCell>
                    <TableCell>{faculty.name}</TableCell>
                    <TableCell>{faculty.studentCount}</TableCell>
                    <TableCell>{faculty.moduleCount}</TableCell>
                    <TableCell>{faculty.programCount}</TableCell>
                    <TableCell>{faculty.activityLevel}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  const renderPrograms = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Filter by Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {facultyStats.map((faculty) => (
                <SelectItem key={faculty.facultyCode} value={faculty.facultyCode}>
                  {faculty.facultyCode} - {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Program List</CardTitle>
            <CardDescription>
              {selectedFaculty ? `Programs in ${selectedFaculty} faculty` : "All programs in the CUT eLearning system"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Code</TableHead>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Activity Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No programs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrograms.map((program) => (
                    <TableRow key={program.programCode}>
                      <TableCell>{program.programCode}</TableCell>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{program.facultyCode}</TableCell>
                      <TableCell>{program.studentCount}</TableCell>
                      <TableCell>{program.moduleCount}</TableCell>
                      <TableCell>{program.activityLevel}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {!selectedFaculty && (
          <Card>
            <CardHeader>
              <CardTitle>Top Programs by Student Count</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                data={programStats
                  .sort((a, b) => b.studentCount - a.studentCount)
                  .slice(0, 10)
                  .map((program) => ({
                    name: program.programCode,
                    value: program.studentCount,
                  }))}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value} students`}
                yAxisWidth={60}
              />
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculties</h1>
          <p className="text-muted-foreground">View and analyze faculty and program data</p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker
            onChange={(range) => {
              console.log("Date range selected:", range)
              // You can implement date filtering here if needed
            }}
          />
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="faculties">Faculties</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>
        <TabsContent value="faculties" className="mt-6">
          {renderFaculties()}
        </TabsContent>
        <TabsContent value="programs" className="mt-6">
          {renderPrograms()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FacultiesPage

