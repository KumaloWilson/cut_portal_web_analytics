"use client"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useTheme } from "../../contexts/ThemeContext"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { SidebarProvider } from "../../components/ui/sidebar"


export default function Layout() {
  const { theme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className={theme}>
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-0">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

