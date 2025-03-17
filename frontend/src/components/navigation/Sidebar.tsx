"use client"

import type React from "react"
import { NavLink } from "react-router-dom"
import { BarChart2, List, Users, BookOpen, School, Settings, Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"

const Sidebar: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex md:flex-col transition-colors duration-200">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">CUT Analytics</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">eLearning Portal Insights</p>
      </div>

      <nav className="mt-6 flex-1">
        <NavItem to="/" icon={<BarChart2 size={20} />} label="Dashboard" />
        <NavItem to="/events" icon={<List size={20} />} label="Event Logs" />
        <NavItem to="/students" icon={<Users size={20} />} label="Students" />
        <NavItem to="/modules" icon={<BookOpen size={20} />} label="Modules" />
        <NavItem to="/faculties" icon={<School size={20} />} label="Faculties" />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setTheme("light")}
              className={`p-2 rounded-md ${
                theme === "light"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              aria-label="Light mode"
            >
              <Sun size={18} />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-2 rounded-md ${
                theme === "dark"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              aria-label="Dark mode"
            >
              <Moon size={18} />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`p-2 rounded-md ${
                theme === "system"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              aria-label="System preference"
            >
              <Laptop size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 font-semibold">CUT</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800 dark:text-white">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Analytics Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
          isActive
            ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400"
            : ""
        }`
      }
      end
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

export default Sidebar

