"use client"

import { useState } from "react"
import { useLocation } from "react-router-dom"
import { Bell, Search, X, Download } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { SidebarTrigger } from "../../components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { DatePickerWithRange } from "../../components/ui/date_range_picker"
import { exportToExcel, exportToCSV, exportToPDF } from "../../utils/exportUtils"

interface HeaderProps {
  onExport?: () => void
}

export default function Header({ onExport }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === "/") return "Dashboard"
    if (path.startsWith("/events")) return "Event Logs"
    if (path.startsWith("/students")) {
      if (path.split("/").length > 2) return "Student Details"
      return "Students"
    }
    if (path.startsWith("/modules")) {
      if (path.split("/").length > 2) return "Module Details"
      return "Modules"
    }
    if (path.startsWith("/faculties")) return "Faculties"
    if (path.startsWith("/reports")) return "Reports"
    if (path.startsWith("/settings")) return "Settings"
    return "CUT eLearning Analytics"
  }

  const handleExport = (type: "excel" | "csv" | "pdf") => {
    // If custom export function is provided, use it
    if (onExport) {
      onExport()
      return
    }

    // Default export behavior
    const data = [
      { id: 1, name: "Sample Data", value: 100 },
      { id: 2, name: "More Data", value: 200 },
    ]

    if (type === "excel") {
      exportToExcel(
        [{ sheetName: "Data", data }],
        `CUT_Analytics_${getPageTitle()}_${new Date().toISOString().split("T")[0]}`,
      )
    } else if (type === "csv") {
      exportToCSV(data, `CUT_Analytics_${getPageTitle()}_${new Date().toISOString().split("T")[0]}`)
    } else if (type === "pdf") {
      exportToPDF(data, `CUT_Analytics_${getPageTitle()}_${new Date().toISOString().split("T")[0]}`)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />

      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        {location.pathname === "/" && (
          <Badge variant="outline" className="ml-2">
            Real-time
          </Badge>
        )}
      </div>

      <div className="ml-auto flex items-center gap-4">
        {searchOpen ? (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md pl-8 md:w-[300px]"
              autoFocus
              onBlur={() => setSearchOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="icon" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        )}

        {location.pathname !== "/settings" && (
          <>
            <DatePickerWithRange className="hidden md:flex" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("excel")}>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}

