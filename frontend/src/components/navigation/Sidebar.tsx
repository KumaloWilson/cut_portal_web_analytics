import type React from "react"
import { NavLink } from "react-router-dom"
import { BarChart2, List, Users, Settings } from "lucide-react"

const Sidebar: React.FC = () => {
    return (
        <div className="w-64 bg-white shadow-md hidden md:block">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold text-gray-800">CUT Analytics</h1>
                <p className="text-sm text-gray-600">eLearning Portal Insights</p>
            </div>

            <nav className="mt-6">
                <NavItem to="/" icon={<BarChart2 size={20} />} label="Dashboard" />
                <NavItem to="/events" icon={<List size={20} />} label="Event Logs" />
                <NavItem to="/users" icon={<Users size={20} />} label="Users" />
                <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
            </nav>

            <div className="absolute bottom-0 w-64 p-6 border-t">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">CUT</span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">Admin User</p>
                        <p className="text-xs text-gray-500">Analytics Dashboard</p>
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
                `flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 ${isActive ? "bg-gray-100 text-blue-600 border-r-4 border-blue-600" : ""
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

