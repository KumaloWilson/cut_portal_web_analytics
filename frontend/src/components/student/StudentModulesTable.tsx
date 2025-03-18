"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Search } from "lucide-react"

interface Module {
  id: string
  moduleCode: string
  name: string
  facultyCode: string
  programCode: string
  activityLevel: "High" | "Medium" | "Low"
  lastAccess: string
  resourcesAccessed: number
  totalResources: number
  timeSpentMinutes: number
  grade?: string | null
}

interface StudentModulesTableProps {
  modules: Module[]
  studentId: string
}

const StudentModulesTable: React.FC<StudentModulesTableProps> = ({ modules, studentId }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortField, setSortField] = useState<keyof Module>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: keyof Module) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredModules = modules.filter(
    (module) =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.moduleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.facultyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.programCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedModules = [...filteredModules].sort((a, b) => {
    const fieldA = a[sortField]
    const fieldB = b[sortField]

    if (fieldA === null || fieldA === undefined) return sortDirection === "asc" ? -1 : 1
    if (fieldB === null || fieldB === undefined) return sortDirection === "asc" ? 1 : -1

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
    }

    // For numeric fields
    return sortDirection === "asc" ? (fieldA as number) - (fieldB as number) : (fieldB as number) - (fieldA as number)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Modules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
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
                <TableHead className="cursor-pointer" onClick={() => handleSort("activityLevel")}>
                  Activity
                  {sortField === "activityLevel" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("lastAccess")}>
                  Last Access
                  {sortField === "lastAccess" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("resourcesAccessed")}>
                  Resources
                  {sortField === "resourcesAccessed" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("timeSpentMinutes")}>
                  Time (mins)
                  {sortField === "timeSpentMinutes" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("grade")}>
                  Grade
                  {sortField === "grade" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No modules found
                  </TableCell>
                </TableRow>
              ) : (
                sortedModules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.moduleCode}</TableCell>
                    <TableCell>{module.name}</TableCell>
                    <TableCell>{module.facultyCode}</TableCell>
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
                      {module.lastAccess ? new Date(module.lastAccess).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      {module.resourcesAccessed} / {module.totalResources}
                    </TableCell>
                    <TableCell>{module.timeSpentMinutes.toFixed(1)}</TableCell>
                    <TableCell>
                      {module.grade ? (
                        <Badge variant="outline">{module.grade}</Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
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
        </div>
      </CardContent>
    </Card>
  )
}

export default StudentModulesTable

