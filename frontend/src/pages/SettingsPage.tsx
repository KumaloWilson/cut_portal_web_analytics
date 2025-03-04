"use client"

import type React from "react"
import { useState } from "react"
import { Save, RefreshCw, Trash2, Download } from "lucide-react"
import toast from "react-hot-toast"

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState({
        apiUrl: "http://localhost:3000",
        dataRetentionDays: 90,
        refreshInterval: 30,
        enableRealTimeUpdates: true,
        enableNotifications: true,
        darkMode: false,
    })

    const [isLoading, setIsLoading] = useState(false)

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target

        setSettings({
            ...settings,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Settings saved successfully")

            // Save settings to localStorage
            localStorage.setItem("analyticsSettings", JSON.stringify(settings))
        }, 1000)
    }

    // Handle data purge
    const handlePurgeData = () => {
        if (window.confirm("Are you sure you want to purge all analytics data? This action cannot be undone.")) {
            toast.success("Data purge initiated")
        }
    }

    // Handle data export
    const handleExportData = () => {
        toast.success("Data export started. You will be notified when the export is ready.")
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics Configuration</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Configure your analytics dashboard and data collection settings.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
                                API URL
                            </label>
                            <input
                                type="text"
                                name="apiUrl"
                                id="apiUrl"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={settings.apiUrl}
                                onChange={handleChange}
                            />
                            <p className="mt-1 text-xs text-gray-500">The URL of the analytics API server.</p>
                        </div>

                        <div>
                            <label htmlFor="dataRetentionDays" className="block text-sm font-medium text-gray-700">
                                Data Retention (days)
                            </label>
                            <input
                                type="number"
                                name="dataRetentionDays"
                                id="dataRetentionDays"
                                min="1"
                                max="365"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={settings.dataRetentionDays}
                                onChange={handleChange}
                            />
                            <p className="mt-1 text-xs text-gray-500">Number of days to retain analytics data.</p>
                        </div>

                        <div>
                            <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-700">
                                Dashboard Refresh Interval (seconds)
                            </label>
                            <input
                                type="number"
                                name="refreshInterval"
                                id="refreshInterval"
                                min="5"
                                max="300"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={settings.refreshInterval}
                                onChange={handleChange}
                            />
                            <p className="mt-1 text-xs text-gray-500">How often the dashboard should refresh data.</p>
                        </div>

                        <div className="sm:col-span-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="enableRealTimeUpdates"
                                    id="enableRealTimeUpdates"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={settings.enableRealTimeUpdates}
                                    onChange={handleChange}
                                />
                                <label htmlFor="enableRealTimeUpdates" className="ml-2 block text-sm text-gray-700">
                                    Enable real-time updates
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Receive real-time updates when new events are tracked.</p>
                        </div>

                        <div className="sm:col-span-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="enableNotifications"
                                    id="enableNotifications"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={settings.enableNotifications}
                                    onChange={handleChange}
                                />
                                <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-700">
                                    Enable notifications
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Receive notifications for important analytics events.</p>
                        </div>

                        <div className="sm:col-span-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="darkMode"
                                    id="darkMode"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={settings.darkMode}
                                    onChange={handleChange}
                                />
                                <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">
                                    Dark Mode
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Enable dark mode for the dashboard.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Data Management</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your analytics data.</p>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                onClick={handleExportData}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Data
                            </button>
                            <p className="mt-1 text-xs text-gray-500">Export all analytics data as CSV or JSON.</p>
                        </div>

                        <div>
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={handlePurgeData}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Purge All Data
                            </button>
                            <p className="mt-1 text-xs text-gray-500">
                                Permanently delete all analytics data. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage

