"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
//import { Pagination } from "../components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { fetchModules, fetchFacultyStats, fetchProgramStats } from "../services/api"
import  LoadingSpinner  from "../components/common/LoadingSpinner"
import  ErrorDisplay  from "../components/common/ErrorDisplay"
import  DateRangePicker  from "../components/common/DateRangePicker"
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/exportUtils"
import  {BarChart}  from "../components/ui/chart"
import { Download, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Pagination from '../components/common/Pagination';

const ModulesPage: React.FC = () => {
  const navigate = useNavigate()
  const [modules, setModules] = useState<any[]>([])
  const [facultyStats, setFacultyStats] = useState<any[]>([])
  const [programStats, setProgramStats] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalModules, setTotalModules] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [facultyFilter, setFacultyFilter] = useState<string>("")
  const [programFilter, setProgramFilter] = useState<string>("")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [faculties, setFaculties] = useState<string[]>([])
  const [programs, setPrograms] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("list")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch modules with pagination and filtering
        const modulesData = await fetchModules(page, limit, {
          search: searchTerm,
          facultyCode: facultyFilter,
          programCode: programFilter,
          sort: sortField,
          direction: sortDirection,
        })

        setModules(modulesData.modules)
        setTotalPages(modulesData.totalPages)
        setTotalModules(modulesData.total)

        // Fetch faculty stats
        const facultyData = await fetchFacultyStats()
        setFacultyStats(facultyData)
        setFaculties(facultyData.map((f: any) => f.facultyCode))

        // Fetch program stats
        const programData = await fetchProgramStats()
        setProgramStats(programData)
        setPrograms(programData.map((p: any) => p.programCode))

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch modules data")
        setLoading(false)
        console.error(err)
      }
    }

    fetchData()
  }, [page, limit, searchTerm, facultyFilter, programFilter, sortField, sortDirection])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on new search
  }

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleExport = (type: "excel" | "csv" | "pdf") => {
    const data = modules.map((module) => ({
      "Module Code": module.moduleCode,
      "Module Name": module.name,
      Faculty: module.facultyCode,
      Program: module.programCode,
      Students: module.studentCount,
      Resources: module.resourceCount,
      "Activity Level": module.activityLevel,
    }))

    const fileName = "modules-report"

    if (type === "excel") {
      exportToExcel([{ sheetName: "Modules", data }], fileName)
    } else if (type === "csv") {
      exportToCSV(data, fileName)
    } else if (type === "pdf") {
      exportToPDF(data, fileName, "Modules Report")
    }
  }

  const renderModulesList = () => {
    if (loading) {
      return <LoadingSpinner />
    }

    if (error) {
      return <ErrorDisplay error={new Error(error || '')} />
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
            <Button type="submit" variant="secondary" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={limit.toString()} onValueChange={(val) => setLimit(Number.parseInt(val))}>
              <SelectTrigger className="w-full md:w-24">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("moduleCode")}>
                    Module Code
                    {sortField === "moduleCode" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    Module Name
                    {sortField === "name" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("facultyCode")}>
                    Faculty
                    {sortField === "facultyCode" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("studentCount")}>
                    Students
                    {sortField === "studentCount" && (
                      <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("resourceCount")}>
                    Resources
                    {sortField === "resourceCount" && (
                      <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("activityLevel")}>
                    Activity
                    {sortField === "activityLevel" && (
                      <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No modules found
                    </TableCell>
                  </TableRow>
                ) : (
                  modules.map((module) => (
                    <TableRow key={module.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>{module.moduleCode}</TableCell>
                      <TableCell>{module.name}</TableCell>
                      <TableCell>{module.facultyCode}</TableCell>
                      <TableCell>{module.studentCount}</TableCell>
                      <TableCell>{module.resourceCount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            module.activityLevel === "High"
                              ? "default"
                              : module.activityLevel === "Medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {module.activityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/modules/${module.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {modules.length} of {totalModules} modules
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} limit={0} onLimitChange={function (limit: number): void {
                    throw new Error("Function not implemented.")
                } } totalItems={0} />
        </div>
      </div>
    )
  }

  const renderModulesAnalytics = () => {
    if (loading) {
      return <LoadingSpinner />
    }

    if (error) {
      return <ErrorDisplay error={new Error(error || '')} />
    }

    // Prepare data for faculty distribution chart
    const facultyData = facultyStats.map((faculty) => ({
      name: faculty.facultyCode,
      value: faculty.moduleCount,
    }))

    // Prepare data for program distribution chart
    const programData = programStats.slice(0, 10).map((program) => ({
      name: program.programCode,
      value: program.moduleCount,
    }))

    // Prepare data for activity level chart
    const activityData = [
      { name: "High", value: modules.filter((m) => m.activityLevel === "High").length },
      { name: "Medium", value: modules.filter((m) => m.activityLevel === "Medium").length },
      { name: "Low", value: modules.filter((m) => m.activityLevel === "Low").length },
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Modules by Faculty</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                data={facultyData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value: any) => `${value} modules`}
                yAxisWidth={60}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Programs by Module Count</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                data={programData}
                index="name"
                categories={["value"]}
                colors={["green"]}
                valueFormatter={(value: any) => `${value} modules`}
                yAxisWidth={60}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart
              data={activityData}
              index="name"
              categories={["value"]}
              colors={["purple"]}
              valueFormatter={(value: any) => `${value} modules`}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">View and analyze all modules in the CUT eLearning system</p>
        </div>
        <DateRangePicker
                  onChange={(startDate, endDate) => {
                      console.log("Date range selected:", { startDate, endDate })
                      // You can implement date filtering here if needed
                  }}
                  startDate={new Date()}
                  endDate={new Date()}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-80 grid-cols-2">
          <TabsTrigger value="list">Module List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          {renderModulesList()}
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          {renderModulesAnalytics()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ModulesPage

