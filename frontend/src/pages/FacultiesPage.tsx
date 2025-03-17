"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { useSocket } from "../contexts/SocketContext"
import { fetchFacultyStats } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { School, Download } from "lucide-react"
import Header from "../components/navigation/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsivePie } from "@nivo/pie"
import { ResponsiveBar } from "@nivo/bar"
import { exportToExcel } from "../utils/exportUtils"

const FacultiesPage: React.FC = () => {
  const socket = useSocket()
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch faculty stats
  const { data, isLoading, isError, error, refetch } = useQuery(["facultyStats"], () => fetchFacultyStats(), {
    refetchOnWindowFocus: false,
  })

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on("newEvent", () => {
        // Refetch data when new events are received
        refetch()
      })

      return () => {
        socket.off("newEvent")
      }
    }
  }, [socket, refetch])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle export
  const handleExport = () => {
    if (data && data.faculties) {
      exportToExcel(
        [
          {
            sheetName: "Faculties",
            data: data.faculties.map((faculty: any) => ({
              faculty_code: faculty.faculty_code,
              faculty_name: faculty.faculty_name,
              student_count: faculty.student_count,
              module_count: faculty.module_count,
              program_count: faculty.program_count,
            })),
          },
        ],
        `CUT_Faculties_${new Date().toISOString().split("T")[0]}`,
      )
    }
  }

  // Filter faculties based on search term
  const filteredFaculties =
    data?.faculties?.filter(
      (faculty: any) =>
        faculty.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.faculty_code.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return <ErrorDisplay error={error as Error} />
  }

  return (
    <div className="flex flex-col h-full">
      <Header onExport={handleExport} />

      <div className="p-6 bg-gray-50 dark:bg-gray-900 flex-1 overflow-y-auto transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Faculties</h1>

          <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        <div className="mb-6">
          <div className="max-w-md">
            <label htmlFor="search" className="sr-only">
              Search faculties
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors duration-200"
                placeholder="Search faculties..."
                type="search"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Faculty Distribution</CardTitle>
              <CardDescription>Student distribution across faculties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsivePie
                  data={data.faculties.map((faculty: any) => ({
                    id: faculty.faculty_code,
                    label: faculty.faculty_name,
                    value: faculty.student_count,
                  }))}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: "blues" }}
                  borderWidth={1}
                  borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor={{ from: "color", modifiers: [] }}
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                  legends={[
                    {
                      anchor: "bottom",
                      direction: "row",
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: "#999",
                      itemDirection: "left-to-right",
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: "circle",
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Faculty Modules</CardTitle>
              <CardDescription>Module count by faculty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveBar
                  data={data.faculties.map((faculty: any) => ({
                    faculty: faculty.faculty_code,
                    modules: faculty.module_count,
                    programs: faculty.program_count,
                  }))}
                  keys={["modules", "programs"]}
                  indexBy="faculty"
                  margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                  padding={0.3}
                  groupMode="grouped"
                  valueScale={{ type: "linear" }}
                  indexScale={{ type: "band", round: true }}
                  colors={["#0077b6", "#00b4d8"]}
                  borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Faculty",
                    legendPosition: "middle",
                    legendOffset: 32,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Count",
                    legendPosition: "middle",
                    legendOffset: -40,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                  legends={[
                    {
                      dataFrom: "keys",
                      anchor: "bottom-right",
                      direction: "column",
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: "left-to-right",
                      itemOpacity: 0.85,
                      symbolSize: 20,
                      effects: [
                        {
                          on: "hover",
                          style: {
                            itemOpacity: 1,
                          },
                        },
                      ],
                    },
                  ]}
                  animate={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Faculty List</CardTitle>
            <CardDescription>All faculties and their statistics</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Faculty Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Faculty Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Programs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Modules
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredFaculties.map((faculty: any, index: number) => (
                    <tr
                      key={faculty.faculty_code}
                      className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {faculty.faculty_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {faculty.faculty_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {faculty.student_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {faculty.program_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {faculty.module_count}
                      </td>
                    </tr>
                  ))}

                  {filteredFaculties.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No faculties found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FacultiesPage

