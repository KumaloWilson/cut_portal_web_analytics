"use client"

import { NavLink } from "react-router-dom"
import { useTheme } from "../../contexts/ThemeContext"
import { BarChart2, List, Users, BookOpen, School, Settings, Moon, Sun, Laptop, FileText, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "../../components/ui/sidebar"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"

export default function SidebarComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-primary-foreground">CUT</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">CUT Analytics</span>
            <span className="text-xs text-muted-foreground">eLearning Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <NavLink to="/" end>
                  <BarChart2 className="h-4 w-4" />
                  <span>Dashboard</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Events">
                <NavLink to="/events">
                  <List className="h-4 w-4" />
                  <span>Event Logs</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Students">
                <NavLink to="/students">
                  <Users className="h-4 w-4" />
                  <span>Students</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Modules">
                <NavLink to="/modules">
                  <BookOpen className="h-4 w-4" />
                  <span>Modules</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Faculties">
                <NavLink to="/faculties">
                  <School className="h-4 w-4" />
                  <span>Faculties</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Reports">
                <NavLink to="/reports">
                  <FileText className="h-4 w-4" />
                  <span>Reports</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Preferences</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <NavLink to="/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2">
          <TooltipProvider>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-medium text-muted-foreground">Theme</span>
              <div className="flex space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setTheme("light")}
                      variant={theme === "light" ? "default" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Sun className="h-4 w-4" />
                      <span className="sr-only">Light</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Light</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setTheme("dark")}
                      variant={theme === "dark" ? "default" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Moon className="h-4 w-4" />
                      <span className="sr-only">Dark</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Dark</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setTheme("system")}
                      variant={theme === "system" ? "default" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Laptop className="h-4 w-4" />
                      <span className="sr-only">System</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>System</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>

          <div className="flex items-center gap-3 rounded-md border p-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-xs text-muted-foreground">admin@cut.ac.zw</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

