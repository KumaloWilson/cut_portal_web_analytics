import { EventType, type TrackingEvent } from "../types/events"

// Declare chrome if it's not available in the current environment (e.g., testing)
declare const chrome: any

class ContentTracker {
    private readonly API_URL = "http://localhost:3000/api"
    private isTracking = true
    private sessionStartTime: number
    private lastActivityTime: number
    private userId: string | null = null

    constructor() {
        this.sessionStartTime = Date.now()
        this.lastActivityTime = this.sessionStartTime
        this.initializeTracking()
    }

    private async initializeTracking(): Promise<void> {
        // Check if tracking is enabled
        chrome.storage.local.get(["tracking", "userId"], (result) => {
            this.isTracking = result.tracking !== false
            this.userId = result.userId || null

            if (this.isTracking) {
                this.setupEventListeners()
                this.trackPageView()
                this.extractUserInfo()
            }
        })
    }

    private extractUserInfo(): void {
        // Try to extract user information from the page
        const usernameElement = document.querySelector(".username") as HTMLElement
        if (usernameElement && usernameElement.textContent) {
            const username = usernameElement.textContent.trim()
            chrome.storage.local.set({ userId: username })
            this.userId = username
        }
    }

    private setupEventListeners(): void {
        // Track clicks
        document.addEventListener("click", this.handleClick.bind(this))

        // Track form submissions
        document.addEventListener("submit", this.handleFormSubmit.bind(this))

            // Track user activity for time spent calculation
            ;["mousemove", "keydown", "scroll"].forEach((eventType) => {
                document.addEventListener(eventType, this.updateActivityTime.bind(this))
            })

        // Track page unload to calculate time spent
        window.addEventListener("beforeunload", this.handleUnload.bind(this))
    }

    private updateActivityTime(): void {
        this.lastActivityTime = Date.now()
    }

    private handleClick(event: MouseEvent): void {
        if (!this.isTracking) return

        const target = event.target as HTMLElement

        // Track button clicks
        if (target.tagName === "BUTTON" || target.tagName === "A" || target.closest("button") || target.closest("a")) {
            const element =
                target.tagName === "BUTTON" || target.tagName === "A" ? target : target.closest("button") || target.closest("a")

            if (element) {
                this.trackEvent(EventType.BUTTON_CLICK, {
                    text: element.textContent?.trim() || "",
                    href: (element as HTMLAnchorElement).href || "",
                    id: element.id || "",
                    class: element.className || "",
                })
            }
        }
    }

    private handleFormSubmit(event: SubmitEvent): void {
        if (!this.isTracking) return

        const form = event.target as HTMLFormElement
        this.trackEvent(EventType.FORM_SUBMIT, {
            action: form.action || "",
            id: form.id || "",
            formElements: this.getFormElementNames(form),
        })
    }

    private getFormElementNames(form: HTMLFormElement): string[] {
        const elements = Array.from(form.elements) as HTMLElement[]
        return elements.filter((el) => (el as HTMLInputElement).name).map((el) => (el as HTMLInputElement).name)
    }

    private handleUnload(): void {
        if (!this.isTracking) return

        const timeSpent = Date.now() - this.sessionStartTime
        this.trackEvent(EventType.PAGE_EXIT, {
            timeSpent: timeSpent,
            url: window.location.href,
        })
    }

    private trackPageView(): void {
        this.trackEvent(EventType.PAGE_VIEW, {
            title: document.title,
            url: window.location.href,
            referrer: document.referrer,
        })
    }

    private trackEvent(eventType: EventType, details: Record<string, any>): void {
        if (!this.isTracking) return

        const event: TrackingEvent = {
            eventType,
            url: window.location.href,
            path: window.location.pathname,
            details,
            timestamp: new Date().toISOString(),
            userId: this.userId,
        }

        // Send event to background script to avoid CORS issues
        chrome.runtime.sendMessage({ action: "trackEvent", event })

        // Also log to console for debugging
        console.log("Tracked event:", event)
    }
}

// Initialize the tracker
const tracker = new ContentTracker()

