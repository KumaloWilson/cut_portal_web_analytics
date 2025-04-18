"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import type { ModuleEngagement } from "@/types"
import { BookOpen } from "lucide-react"

interface ModuleEngagementListProps {
  modules: ModuleEngagement[]
  isLoading: boolean
}

export function ModuleEngagementList({ modules, isLoading }: ModuleEngagementListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        ))}
      </div>
    )
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <BookOpen className="mx-auto h-12 w-12 opacity-20" />
        <p className="mt-2">No module engagement data available</p>
      </div>
    )
  }

  // Sort modules by event count in descending order
  const sortedModules = [...modules].sort((a, b) => b.event_count - a.event_count).slice(0, 5)

  return (
    <div className="space-y-4">
      {sortedModules.map((module, index) => (
        <motion.div
          key={module.module_id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{module.module_name}</p>
              <p className="text-xs text-muted-foreground">{module.module_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{module.student_count} students</div>
            <div className="text-xs px-1.5 py-0.5 bg-muted rounded-md">{module.event_count} events</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
