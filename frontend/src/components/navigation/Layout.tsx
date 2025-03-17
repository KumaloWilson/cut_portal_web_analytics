"use client"

import { useTheme } from "@/contexts/ThemeContext"
import type React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"

const Layout: React.FC = () => {
  const { theme } = useTheme()

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${theme}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

