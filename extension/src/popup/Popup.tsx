"use client"

import type React from "react"
import { useEffect, useState } from "react"
import "./Popup.css"

interface PopupState {
    isTracking: boolean
    userId: string | null
    stats: {
        todayEvents: number
        totalEvents: number
    }
}

// Declare chrome if it's not available globally
declare const chrome: any

const Popup: React.FC = () => {
    const [state, setState] = useState<PopupState>({
        isTracking: true,
        userId: null,
        stats: {
            todayEvents: 0,
            totalEvents: 0,
        },
    })

    useEffect(() => {
        // Load tracking state and user ID from storage
        chrome.storage.local.get(["tracking", "userId"], (result) => {
            setState((prevState) => ({
                ...prevState,
                isTracking: result.tracking !== false,
                userId: result.userId || null,
            }))
        })

        // Fetch stats from the API
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/stats/user", {
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const data = await response.json()
                setState((prevState) => ({
                    ...prevState,
                    stats: {
                        todayEvents: data.todayEvents || 0,
                        totalEvents: data.totalEvents || 0,
                    },
                }))
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        }
    }

    const toggleTracking = () => {
        const newTrackingState = !state.isTracking
        chrome.storage.local.set({ tracking: newTrackingState }, () => {
            setState((prevState) => ({
                ...prevState,
                isTracking: newTrackingState,
            }))
        })
    }

    const openDashboard = () => {
        chrome.tabs.create({ url: "http://localhost:5173" })
    }

    return (
        <div className="popup-container">
            <header className="popup-header">
                <h1>CUT eLearning Analytics</h1>
            </header>

            <div className="popup-content">
                <div className="status-section">
                    <div className="status-indicator">
                        <span className={`status-dot ${state.isTracking ? "active" : "inactive"}`}></span>
                        <span className="status-text">{state.isTracking ? "Tracking Active" : "Tracking Paused"}</span>
                    </div>

                    <button className={`toggle-button ${state.isTracking ? "active" : "inactive"}`} onClick={toggleTracking}>
                        {state.isTracking ? "Pause Tracking" : "Resume Tracking"}
                    </button>
                </div>

                <div className="user-section">
                    <p className="user-info">{state.userId ? `Logged in as: ${state.userId}` : "Not logged in"}</p>
                </div>

                <div className="stats-section">
                    <h2>Your Activity</h2>
                    <div className="stat-item">
                        <span className="stat-label">Today's Events:</span>
                        <span className="stat-value">{state.stats.todayEvents}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Events:</span>
                        <span className="stat-value">{state.stats.totalEvents}</span>
                    </div>
                </div>
            </div>

            <footer className="popup-footer">
                <button className="dashboard-button" onClick={openDashboard}>
                    Open Dashboard
                </button>
            </footer>
        </div>
    )
}

export default Popup

