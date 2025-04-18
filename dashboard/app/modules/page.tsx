"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getModuleEngagement } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart } from "@/components/ui/chart"
import { Search, BookOpen, Users, BarChart3, Filter, ArrowUpDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ModuleEngagement } from "@/types"

export default function ModulesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Fetch module engagement data
  const { data: moduleEngagement, isLoading: isLoadingEngagement } = useQuery({
    queryKey: ["moduleEngagement"],
    queryFn: async () => {
      const response = await getModuleEngagement()
      return response
    },
  })

  // Filter and sort modules
  const filteredModules = moduleEngagement?.filter((module: ModuleEngagement) => {
    const query = searchQuery.toLowerCase()
    return module.module_name.toLowerCase().includes(query) || module.module_code.toLowerCase().includes(query)
  })

  const sortedModules = filteredModules?.sort((a: ModuleEngagement, b: ModuleEngagement) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.module_name.localeCompare(b.module_name)
        : b.module_name.localeCompare(a.module_name)
    } else if (sortBy === "code") {
      return sortOrder === "asc"
        ? a.module_code.localeCompare(b.module_code)
        : b.module_code.localeCompare(a.module_code)
    } else if (sortBy === "students") {
      return sortOrder === "asc" ? a.student_count - b.student_count : b.student_count - a.student_count
    } else if (sortBy === "engagement") {
      return sortOrder === "asc" ? a.event_count - b.event_count : b.event_count - a.event_count
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">Analyze module engagement and student participation</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="mb-6">
        <TabsList>
          <TabsTrigger value="list">Module List</TabsTrigger>
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
                    placeholder="Search modules..."
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
                    Module Name
                    {sortBy === "name" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center cursor-pointer" onClick={() => toggleSort("code")}>
                    Code
                    {sortBy === "code" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center cursor-pointer" onClick={() => toggleSort("students")}>
                    Students
                    {sortBy === "students" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center cursor-pointer" onClick={() => toggleSort("engagement")}>
                    Engagement
                    {sortBy === "engagement" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
                    )}
                  </div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {isLoadingEngagement
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 items-center px-4 py-3 border-b">
                        <div className="col-span-5 flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="col-span-2">
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="col-span-2">
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="col-span-2">
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="col-span-1 text-right">
                          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </div>
                      </div>
                    ))
                  : sortedModules?.map((module: ModuleEngagement, index: number) => (
                      <motion.div
                        key={module.module_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 items-center px-4 py-3 border-b hover:bg-muted/50"
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{module.module_name}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm">{module.module_code}</div>
                        <div className="col-span-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{module.student_count}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span>{module.event_count}</span>
                          </div>
                        </div>
                        <div className="col-span-1 text-right">
                          <Link href={`/modules/${module.module_id}`}>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Engagement</CardTitle>
              <CardDescription>Analyze module activity and student participation</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEngagement ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <BarChart
                  data={
                    moduleEngagement?.map((module: ModuleEngagement) => ({
                      module: module.module_code,
                      students: module.student_count,
                      events: module.event_count,
                    })) || []
                  }
                  categories={["students", "events"]}
                  index="module"
                  colors={["blue", "green"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
