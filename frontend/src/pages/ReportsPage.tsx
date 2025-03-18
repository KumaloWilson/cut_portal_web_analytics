"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { useSocket } from "../contexts/SocketContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  File,
  FileImage,
  FileVideo,
  FileIcon as FilePdf,
  FileArchive,
} from "lucide-react"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ErrorDisplay from "../components/common/ErrorDisplay"
import { exportToExcel } from "../utils/exportUtils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Badge } from "../components/ui/badge"
import Header from "../components/navigation/Header"

const ResourcesPage = () => {
  const socket = useSocket()
  const [searchTerm, setSearchTerm] = useState("")
  const [resourceType, setResourceType] = useState("all")
  const [sortField, setSortField] = useState("accessCount")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch resources data
  const { data, isLoading, isError, error, refetch } = useQuery(
    ["resources", page, pageSize, resourceType, sortField, sortDirection, searchTerm],
    () =>
      fetchResources({
        page,
        pageSize,
        type: resourceType !== "all" ? resourceType : undefined,
        sort: sortField,
        direction: sortDirection,
        search: searchTerm || undefined,
      }),
    {
      refetchOnWindowFocus: false,
    },
  )

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on("newEvent", (event) => {
        if (event.eventType === "resource_access") {
          refetch()
        }
      })

      return () => {
        socket.off("newEvent")
      }
    }
  }, [socket, refetch])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  // Handle export
  const handleExport = () => {
    if (data?.resources) {
      exportToExcel(
        [
          {
            sheetName: "Resources",
            data: data.resources.map((resource: any) => ({
              title: resource.title,
              type: resource.type,
              module: resource.module_title || "N/A",
              accessCount: resource.access_count,
              uniqueUsers: resource.unique_users,
              lastAccessed: resource.last_accessed,
              url: resource.url,
            })),
          },
        ],
        `CUT_Resources_${new Date().toISOString().split("T")[0]}`,
      )
    }
  }

  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FilePdf className="h-4 w-4" />
      case "image":
      case "jpg":
      case "png":
      case "jpeg":
        return <FileImage className="h-4 w-4" />
      case "video":
      case "mp4":
        return <FileVideo className="h-4 w-4" />
      case "zip":
      case "rar":
        return <FileArchive className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header onExport={handleExport} />

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-muted-foreground">Analyze resource usage and student engagement</p>
          </div>

          <Button onClick={handleExport} className="flex items-center gap-2 w-full md:w-auto">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Resource List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </div>
              </form>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {resourceType !== "all" && (
                      <Badge variant="secondary" className="ml-2">
                        {resourceType}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setResourceType("all")}>All Types</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setResourceType("pdf")}>PDF Documents</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setResourceType("video")}>Video Content</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setResourceType("image")}>Images</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setResourceType("document")}>Documents</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setResourceType("archive")}>Archives</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <LoadingSpinner />
                ) : isError ? (
                  <ErrorDisplay error={error as Error} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => toggleSort("accessCount")}>
                          <div className="flex items-center gap-1">
                            <span>Access Count</span>
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => toggleSort("uniqueUsers")}>
                          <div className="flex items-center gap-1">
                            <span>Unique Users</span>
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => toggleSort("lastAccessed")}>
                          <div className="flex items-center gap-1">
                            <span>Last Accessed</span>
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.resources?.length > 0 ? (
                        data.resources.map((resource: any) => (
                          <TableRow key={resource.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getResourceIcon(resource.type)}
                                <span>{resource.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{resource.type}</Badge>
                            </TableCell>
                            <TableCell>{resource.module_title || "N/A"}</TableCell>
                            <TableCell>{resource.access_count}</TableCell>
                            <TableCell>{resource.unique_users}</TableCell>
                            <TableCell>
                              {resource.last_accessed ? new Date(resource.last_accessed).toLocaleString() : "Never"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No resources found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Types Distribution</CardTitle>
                  <CardDescription>Breakdown of resource types</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {/* Resource types chart component */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Resource types distribution chart
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Accessed Resources</CardTitle>
                  <CardDescription>Top resources by access count</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {/* Most accessed resources chart component */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Most accessed resources chart
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resource Access Timeline</CardTitle>
                <CardDescription>Resource access patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {/* Resource access timeline chart component */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Resource access timeline chart
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ResourcesPage

