"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { useSocket } from "../contexts/SocketContext"
import { fetchStudents, fetchFacultyStats, fetchProgramStats } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { User, Filter, X, Download, ChevronDown, ChevronUp } from "lucide-react"
import Header from "../components/navigation/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { exportToExcel } from "../utils/exportUtils"

const StudentsPage: React.FC = () => {
  const socket = useSocket()
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [filters, setFilters] = useState({
    facultyCode: "",
    programCode: "",
    level: "",
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortField, setSortField] = useState<string>("last_active_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Fetch students data
  const { data, isLoading, isError, error, refetch } = useQuery(
    ["students", page, limit, filters, searchTerm, sortField, sortDirection],
    () => fetchStudents(page, limit, { ...filters, search: searchTerm, sort: sortField, direction: sortDirection }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  )

  // Fetch faculty stats for filter options
  const { data: facultyData } = useQuery(["facultyStats"], () => fetchFacultyStats(), {
    refetchOnWindowFocus: false,
  })

  // Fetch program stats for filter options
  const { data: programData } = useQuery(["programStats"], () => fetchProgramStats(), {
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
    setPage(1) // Reset to first page when search changes
  }

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    setPage(1) // Reset to first page when filters change
  }

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle export
  const handleExport = () => {
    if (data && data.students) {
      exportToExcel(
        [
          {
            sheetName: "Students",
            data: data.students.map((student: any) => ({
              student_id: student.student_id,
              first_name: student.first_name,
              last_name: student.last_name,
              email: student.email,
              program_code: student.program_code,
              program_name: student.program_name,
              faculty_code: student.faculty_code,
              faculty_name: student.faculty_name,
              level: student.level,
              last_active_at: student.last_active_at,
            })),
          },
        ],
        `CUT_Students_${new Date().toISOString().split("T")[0]}`,
      )
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Students</h1>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span>Filter</span>
              {Object.values(filters).some((v) => v !== "") && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={handleExport}
              className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="max-w-md">
            <label htmlFor="search" className="sr-only">
              Search students
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors duration-200"
                placeholder="Search students..."
                type="search"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {isFilterOpen && (
          <Card className="mb-6 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Filter Students</CardTitle>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CardDescription>Filter students by faculty, program, and level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="facultyCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Faculty
                  </label>
                  <select
                    id="facultyCode"
                    name="facultyCode"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors duration-200"
                    value={filters.facultyCode}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Faculties</option>
                    {facultyData?.faculties?.map((faculty: any) => (
                      <option key={faculty.faculty_code} value={faculty.faculty_code}>
                        {faculty.faculty_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="programCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Program
                  </label>
                  <select
                    id="programCode"
                    name="programCode"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors duration-200"
                    value={filters.programCode}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Programs</option>
                    {programData?.programs?.map((program: any) => (
                      <option key={program.program_code} value={program.program_code}>
                        {program.program_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-colors duration-200"
                    value={filters.level}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Levels</option>
                    {programData?.levels?.map((level: any) => (
                      <option key={level.level} value={level.level}>
                        {level.level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
                  onClick={() => {
                    setFilters({
                      facultyCode: "",
                      programCode: "",
                      level: "",
                    })
                    setPage(1)
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("student_id")}
                    >
                      <div className="flex items-center">
                        <span>Student ID</span>
                        {sortField === "student_id" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("first_name")}
                    >
                      <div className="flex items-center">
                        <span>Name</span>
                        {sortField === "first_name" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Level
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("last_active_at")}
                    >
                      <div className="flex items-center">
                        <span>Last Active</span>
                        {sortField === "last_active_at" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {data.students.map((student: any, index: number) => (
                    <tr
                      key={student.student_id}
                      className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <Link
                          to={`/students/${student.student_id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {student.student_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-semibold">
                              {student.first_name ? student.first_name.charAt(0).toUpperCase() : "?"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="max-w-xs truncate" title={student.program_name}>
                          {student.program_name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{student.program_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.faculty_name || "N/A"}
                        <div className="text-xs text-gray-400 dark:text-gray-500">{student.faculty_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.level || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.last_active_at ? new Date(student.last_active_at).toLocaleString() : "Never"}
                      </td>
                    </tr>
                  ))}

                  {data.students.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No students found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0 text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(page * limit, data.total)}</span> of{" "}
                  <span className="font-medium">{data.total}</span> results
                </div>

                <div className="flex items-center">
                  {/* Items per page selector */}
                  <div className="mr-4">
                    <label htmlFor="limit" className="sr-only">
                      Items per page
                    </label>
                    <select
                      id="limit"
                      className="border border-gray-300 dark:border-gray-600 rounded-md text-sm py-1 px-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value))
                        setPage(1)
                      }}
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>

                  {/* Pagination controls */}
                  <nav className="flex items-center">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className={`p-1 rounded-md ${
                        page === 1
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } transition-colors duration-200`}
                      aria-label="Previous page"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                      Page {page} of {Math.ceil(data.total / limit)}
                    </span>

                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(data.total / limit)}
                      className={`p-1 rounded-md ${
                        page >= Math.ceil(data.total / limit)
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } transition-colors duration-200`}
                      aria-label="Next page"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StudentsPage

