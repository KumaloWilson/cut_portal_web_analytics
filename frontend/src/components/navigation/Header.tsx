"use client"

import type React from "react"
import { useState } from "react"
import { Menu, Bell, Search, X } from "lucide-react"

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <header className="bg-white shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    {/* Search */}
                    <div className="max-w-lg w-full lg:max-w-xs hidden md:block">
                        <label htmlFor="search" className="sr-only">
                            Search
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Search events, users..."
                                type="search"
                            />
                        </div>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center">
                        {/* Notifications */}
                        <button type="button" className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none">
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" />
                        </button>

                        {/* Profile dropdown */}
                        <div className="ml-3 relative">
                            <div>
                                <button
                                    type="button"
                                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none"
                                    id="user-menu"
                                    aria-expanded="false"
                                    aria-haspopup="true"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-gray-600 font-semibold">A</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on mobile menu state */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="/" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-gray-100">
                            Dashboard
                        </a>
                        <a
                            href="/events"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                            Event Logs
                        </a>
                        <a
                            href="/users"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                            Users
                        </a>
                        <a
                            href="/settings"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                            Settings
                        </a>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header

