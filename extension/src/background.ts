import type { TrackingEvent } from "../types/events"

// Declare chrome as a global variable to avoid Typescript errors
declare const chrome: any

class BackgroundService {
    private readonly API_URL = "http://localhost:3000/api"
    private queue: TrackingEvent[] = []
    private isSending = false
    private flushInterval = 5000 // 5 seconds

    constructor() {
        this.initializeListeners()
        this.setupPeriodicFlush()
    }

    private initializeListeners(): void {
        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "trackEvent") {
                // Add IP address if available
                if (sender.tab && sender.tab.id) {
                    message.event.ipAddress = sender.tab.incognito ? null : sender.tab.url?.split("/")[2] || null
                }

                this.queueEvent(message.event)
                sendResponse({ success: true })
            } else if (message.action === "updateUserInfo") {
                this.updateUserInfo(message.userId, message.userInfo)
                sendResponse({ success: true })
            } else if (message.action === "updateCourseInfo") {
                this.updateCourseInfo(message.courseId, message.courseInfo)
                sendResponse({ success: true })
            }
            return true // Keep the message channel open for async response
        })

        // Listen for navigation events
        chrome.webNavigation.onCompleted.addListener((details) => {
            if (details.url.includes("elearning.cut.ac.zw")) {
                chrome.scripting.executeScript({
                    target: { tabId: details.tabId },
                    files: ["content.js"],
                })
            }
        })
    }

    private queueEvent(event: TrackingEvent): void {
        this.queue.push(event)

        // If queue gets too large, flush immediately
        if (this.queue.length >= 10) {
            this.flushQueue()
        }
    }

    private setupPeriodicFlush(): void {
        setInterval(() => {
            if (this.queue.length > 0) {
                this.flushQueue()
            }
        }, this.flushInterval)
    }

    private async flushQueue(): Promise<void> {
        if (this.isSending || this.queue.length === 0) return

        this.isSending = true
        const eventsToSend = [...this.queue]
        this.queue = []

        try {
            const response = await fetch(`${this.API_URL}/events/batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ events: eventsToSend }),
            })

            if (!response.ok) {
                // If sending fails, add events back to the queue
                this.queue = [...eventsToSend, ...this.queue]
                console.error("Failed to send events:", response.statusText)
            }
        } catch (error) {
            // If sending fails, add events back to the queue
            this.queue = [...eventsToSend, ...this.queue]
            console.error("Error sending events:", error)
        } finally {
            this.isSending = false
        }
    }

    private async updateUserInfo(userId: string, userInfo: any): Promise<void> {
        try {
            const response = await fetch(`${this.API_URL}/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userInfo),
            })

            if (!response.ok) {
                console.error("Failed to update user info:", response.statusText)
            }
        } catch (error) {
            console.error("Error updating user info:", error)
        }
    }

    // Complete the BackgroundService class by adding the missing updateCourseInfo method
    private async updateCourseInfo(courseId: string, courseInfo: any): Promise<void> {
        try {
            const response = await fetch(`${this.API_URL}/courses/${courseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(courseInfo),
            })

            if (!response.ok) {
                console.error("Failed to update course info:", response.statusText)
            }
        } catch (error) {
            console.error("Error updating course info:", error)
        }
    }

    // Add at the end of the class definition
}

// Instantiate the BackgroundService class to use it
const backgroundService = new BackgroundService()

// Log that the background service has started
console.log("CUT eLearning Analytics background service started")

