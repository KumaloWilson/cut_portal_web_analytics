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
                this.queueEvent(message.event)
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
}

// Initialize the background service
const backgroundService = new BackgroundService()

