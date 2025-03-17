import { EventType, type TrackingEvent } from "../types/events"

// Declare chrome if it's not available in the current environment (e.g., testing)
declare const chrome: any

class ContentTracker {
    private readonly API_URL = "http://localhost:3000/api"
    private isTracking = true
    private sessionStartTime: number
    private lastActivityTime: number
    private userId: string | null = null
    private sessionId: string | null = null
    private courseId: string | null = null
    private deviceInfo: any = {}
    private browserInfo: any = {}

    constructor() {
        this.sessionStartTime = Date.now()
        this.lastActivityTime = this.sessionStartTime
        this.initializeTracking()
    }

    private async initializeTracking(): Promise<void> {
        // Collect device and browser information
        this.collectDeviceInfo()

        // Check if tracking is enabled
        chrome.storage.local.get(["tracking", "userId", "sessionId"], (result: { tracking: boolean; userId: null; sessionId: string }) => {
            this.isTracking = result.tracking !== false
            this.userId = result.userId || null
            this.sessionId = result.sessionId || this.generateSessionId()

            // Store session ID
            chrome.storage.local.set({ sessionId: this.sessionId })

            if (this.isTracking) {
                this.setupEventListeners()
                this.trackPageView()
                this.extractUserInfo()
                this.extractCourseInfo()
            }
        })
    }

    private collectDeviceInfo(): void {
        // Collect device information
        this.deviceInfo = {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
            platform: navigator.platform,
            language: navigator.language,
        }

        // Collect browser information
        this.browserInfo = {
            userAgent: navigator.userAgent,
            vendor: navigator.vendor,
            cookieEnabled: navigator.cookieEnabled,
        }
    }

    private generateSessionId(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }

    private extractUserInfo(): void {
        // Try to extract user information from the page
        const usernameElement = document.querySelector(".username") as HTMLElement
        if (usernameElement && usernameElement.textContent) {
            const username = usernameElement.textContent.trim()
            chrome.storage.local.set({ userId: username })
            this.userId = username

            // Track login event if user ID is found
            if (this.userId) {
                this.trackEvent(EventType.LOGIN, {
                    method: "auto",
                })
            }
        }

        // Try to extract additional user information
        const userEmailElement = document.querySelector(".user-email") as HTMLElement
        const userRoleElement = document.querySelector(".user-role") as HTMLElement

        const userInfo: any = {}

        if (userEmailElement && userEmailElement.textContent) {
            userInfo.email = userEmailElement.textContent.trim()
        }

        if (userRoleElement && userRoleElement.textContent) {
            userInfo.role = userRoleElement.textContent.trim()
        }

        if (Object.keys(userInfo).length > 0 && this.userId) {
            // Send user info to background script to store in database
            chrome.runtime.sendMessage({
                action: "updateUserInfo",
                userId: this.userId,
                userInfo,
            })
        }
    }

    private extractCourseInfo(): void {
        // Try to extract course information from the URL or page content
        const courseIdMatch = window.location.pathname.match(/\/course\/([^/]+)/)
        if (courseIdMatch && courseIdMatch[1]) {
            this.courseId = courseIdMatch[1]

            // Try to extract course title
            const courseTitleElement = document.querySelector(".course-title, h1") as HTMLElement
            let courseTitle = ""

            if (courseTitleElement && courseTitleElement.textContent) {
                courseTitle = courseTitleElement.textContent.trim()
            }

            // Send course info to background script
            chrome.runtime.sendMessage({
                action: "updateCourseInfo",
                courseId: this.courseId,
                courseInfo: {
                    title: courseTitle,
                    url: window.location.href,
                },
            })
        }
    }

    private setupEventListeners(): void {
        // Track clicks
        document.addEventListener("click", this.handleClick.bind(this))

        // Track form submissions
        document.addEventListener("submit", this.handleFormSubmit.bind(this))

        // Track resource access
        this.setupResourceTracking()

        // Track video interactions
        this.setupVideoTracking()

        // Track quiz attempts
        this.setupQuizTracking()

            // Track user activity for time spent calculation
            ;["mousemove", "keydown", "scroll"].forEach((eventType) => {
                document.addEventListener(eventType, this.updateActivityTime.bind(this))
            })

        // Track page unload to calculate time spent
        window.addEventListener("beforeunload", this.handleUnload.bind(this))

        // Track navigation events
        this.setupNavigationTracking()
    }

    private setupResourceTracking(): void {
        // Track clicks on links to resources
        document
            .querySelectorAll(
                'a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".ppt"], a[href$=".pptx"], a[href$=".zip"]',
            )
            .forEach((link) => {
                link.addEventListener("click", (e) => {
                    const target = e.currentTarget as HTMLAnchorElement
                    this.trackEvent(EventType.RESOURCE_ACCESS, {
                        resourceId: target.href,
                        resourceType: target.href.split(".").pop(),
                        resourceTitle: target.textContent || target.title || target.href,
                    })
                })
            })
    }

    private setupVideoTracking(): void {
        // Track video interactions
        document.querySelectorAll("video").forEach((video) => {
            // Track video play
            video.addEventListener("play", () => {
                this.trackEvent(EventType.VIDEO_INTERACTION, {
                    action: "play",
                    videoSrc: video.currentSrc,
                    currentTime: video.currentTime,
                    duration: video.duration,
                })
            })

            // Track video pause
            video.addEventListener("pause", () => {
                this.trackEvent(EventType.VIDEO_INTERACTION, {
                    action: "pause",
                    videoSrc: video.currentSrc,
                    currentTime: video.currentTime,
                    duration: video.duration,
                })
            })

            // Track video ended
            video.addEventListener("ended", () => {
                this.trackEvent(EventType.VIDEO_INTERACTION, {
                    action: "ended",
                    videoSrc: video.currentSrc,
                    currentTime: video.currentTime,
                    duration: video.duration,
                })
            })

            // Track seeking
            video.addEventListener("seeked", () => {
                this.trackEvent(EventType.VIDEO_INTERACTION, {
                    action: "seeked",
                    videoSrc: video.currentSrc,
                    currentTime: video.currentTime,
                    duration: video.duration,
                })
            })
        })
    }

    private setupQuizTracking(): void {
        // Track quiz submissions
        document.querySelectorAll("form.quiz-form, form.assessment-form").forEach((form) => {
            form.addEventListener("submit", () => {
                // Extract quiz ID from form or URL
                let quizId = (form as HTMLFormElement).dataset.quizId || ""
                if (!quizId) {
                    const quizMatch = window.location.pathname.match(/\/quiz\/([^/]+)/)
                    if (quizMatch) quizId = quizMatch[1]
                }

                this.trackEvent(EventType.QUIZ_ATTEMPT, {
                    quizId,
                    quizTitle: document.querySelector("h1, .quiz-title")?.textContent || "",
                    courseId: this.courseId,
                })
            })
        })
    }

    private setupNavigationTracking(): void {
        // Use MutationObserver to detect navigation changes in single-page applications
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    // Check if the URL has changed since last check
                    const currentPath = window.location.pathname
                    if (this.lastPath !== currentPath) {
                        this.lastPath = currentPath
                        this.trackPageView()
                        this.extractCourseInfo()
                    }
                }
            }
        })

        observer.observe(document.body, { childList: true, subtree: true })
    }

    private lastPath: string = window.location.pathname

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
                    courseId: this.courseId,
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
            courseId: this.courseId,
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
            courseId: this.courseId,
        })
    }

    private trackPageView(): void {
        this.trackEvent(EventType.PAGE_VIEW, {
            title: document.title,
            url: window.location.href,
            referrer: document.referrer,
            courseId: this.courseId,
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
            sessionId: this.sessionId,
            deviceInfo: this.deviceInfo,
            browserInfo: this.browserInfo,
        }

        // Send event to background script to avoid CORS issues
        chrome.runtime.sendMessage({ action: "trackEvent", event })

        // Also log to console for debugging
        console.log("Tracked event:", event)
    }
}

// Initialize the tracker
const tracker = new ContentTracker()

