"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useSocket } from "@/components/socket-provider"
import { useAuth } from "@/lib/auth-context"
import { ModeToggle } from "@/components/mode-toggle"
import { ProtectedRoute } from "@/components/protected-route"
import {
  BarChart3,
  Users,
  BookOpen,
  Clock,
  Home,
  Menu,
  X,
  Activity,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  UserPlus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { Button } from "./ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { isConnected } = useSocket()
  const { admin, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Students",
      href: "/students",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Modules",
      href: "/modules",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Sessions",
      href: "/sessions",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Events",
      href: "/events",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Register Admin",
      href: "/admin/register",
      icon: <UserPlus className="h-5 w-5" />,
    },
  ]

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: isSidebarOpen ? 280 : 0 }}
          animate={{ width: isSidebarOpen ? 280 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "bg-card border-r border-border h-full flex-shrink-0 overflow-hidden",
            isSidebarOpen ? "block" : "hidden md:block",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b border-border px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="rounded-md bg-primary p-1">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-semibold text-xl">CUT Analytics</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid gap-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
                  <span className="text-xs text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
                <ModeToggle />
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center gap-4 border-b border-border bg-background px-6">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle Menu</span>
            </Button>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="ml-auto flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                <span className="sr-only">Notifications</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {admin?.username?.substring(0, 2).toUpperCase() || "AD"}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium">{admin?.username || "Admin"}</div>
                      <div className="text-xs text-muted-foreground">{admin?.email || "admin@cut.ac.zw"}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
