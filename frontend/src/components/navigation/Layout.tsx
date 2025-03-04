import type React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./navigation/Sidebar"
import Header from "./navigation/Header"

const Layout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Layout

