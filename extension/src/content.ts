import { EventType, type TrackingEvent } from "../types/events"

// Declare chrome if it's not available in the current environment (e.g., testing)
declare const chrome: any

class ContentTracker {
  private readonly API_URL = "http://localhost:3000/api"
  private isTracking = true
  private sessionStartTime: number
  private lastActivityTime: number
  private userId: string | null = null
  private studentId: string | null = null
  private sessionId: string | null = null
  private moduleId: string | null = null
  private deviceInfo: any = {}
  private browserInfo: any = {}
  private studentData: any = null

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
        this.extractModuleInfo()
        this.extractStudentDataFromLocalStorage()
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

  private extractStudentDataFromLocalStorage(): void {
    try {
      // Try to get student data from localStorage
      const studentData = localStorage.getItem("currentStudent")

      if (studentData) {
        this.studentData = JSON.parse(studentData)

        // Extract student ID and other relevant information
        if (this.studentData?.profile?.student_id) {
          this.studentId = this.studentData.profile.student_id

          // Send student data to background script
          chrome.runtime.sendMessage({
            action: "updateStudentInfo",
            studentId: this.studentId,
            studentData: this.studentData,
          })

          // Track login event if student ID is found
          this.trackEvent(EventType.LOGIN, {
            method: "localStorage",
            studentId: this.studentId,
            programCode: this.studentData?.registration?.program?.programme_code || null,
            facultyCode: this.studentData?.registration?.program?.faculty_code || null,
            level: this.studentData?.registration?.program?.level || null,
          })
        }
      }
    } catch (error) {
      console.error("Error extracting student data from localStorage:", error)
    }
  }

  private extractUserInfo(): void {
    // Try to extract user information from the page
    const usernameElement = document.querySelector(".username, .user-name") as HTMLElement
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

  private extractModuleInfo(): void {
    // Try to extract module information from the URL or page content
    const moduleIdMatch = window.location.pathname.match(/\/module\/([^/]+)/)
    if (moduleIdMatch && moduleIdMatch[1]) {
      this.moduleId = moduleIdMatch[1]

      // Try to extract module title
      const moduleTitleElement = document.querySelector(".module-title, h1") as HTMLElement
      let moduleTitle = ""

      if (moduleTitleElement && moduleTitleElement.textContent) {
        moduleTitle = moduleTitleElement.textContent.trim()
      }

      // Send module info to background script
      chrome.runtime.sendMessage({
        action: "updateModuleInfo",
        moduleId: this.moduleId,
        moduleInfo: {
          title: moduleTitle,
          url: window.location.href,
        },
      })
    }

    // Check if we're on the modules page and extract modules list
    if (window.location.href.includes("/modules") || window.location.href.includes("/#/modules")) {
      // Try to extract modules from the page or localStorage
      if (this.studentData?.registration?.modules) {
        const modules = this.studentData.registration.modules

        // Send modules info to background script
        chrome.runtime.sendMessage({
          action: "updateModulesList",
          studentId: this.studentId,
          modules: modules,
        })
      }
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

    // Track past exam paper downloads
    this.setupPastExamPaperTracking()

    // Track payment interactions
    this.setupPaymentTracking()

    // Track results viewing
    this.setupResultsTracking()

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
            moduleId: this.moduleId,
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
          moduleId: this.moduleId,
        })
      })
    })
  }

  private setupPastExamPaperTracking(): void {
    // Track past exam paper downloads
    document.querySelectorAll('a[href*="past_exam"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLAnchorElement
        this.trackEvent(EventType.PAST_EXAM_ACCESS, {
          paperUrl: target.href,
          paperTitle: target.textContent || target.title || "",
          moduleId: this.extractModuleCodeFromUrl(target.href),
        })
      })
    })
  }

  private setupPaymentTracking(): void {
    // Track payment page interactions
    if (window.location.href.includes("/payments") || window.location.href.includes("/#/payments")) {
      // Track payment form submissions
      document.querySelectorAll("form.payment-form, button.make-payment").forEach((element) => {
        element.addEventListener("click", () => {
          this.trackEvent(EventType.PAYMENT_INTERACTION, {
            action: "payment_initiated",
            url: window.location.href,
          })
        })
      })
    }
  }

  private setupResultsTracking(): void {
    // Track results page views
    if (window.location.href.includes("/results") || window.location.href.includes("/#/results")) {
      this.trackEvent(EventType.RESULTS_VIEW, {
        url: window.location.href,
        timestamp: new Date().toISOString(),
      })
    }
  }

  private extractModuleCodeFromUrl(url: string): string {
    // Extract module code from URL (e.g., CUCEM302 from a past exam paper URL)
    const moduleCodeMatch = url.match(/\/([A-Z]+\d+)\//)
    return moduleCodeMatch ? moduleCodeMatch[1] : "unknown"
  }

  private setupNavigationTracking(): void {
    // Use MutationObserver to detect navigation changes in single-page applications
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if the URL has changed since last check
          const currentPath = window.location.pathname + window.location.hash
          if (this.lastPath !== currentPath) {
            this.lastPath = currentPath
            this.trackPageView()
            this.extractModuleInfo()

            // Check for specific pages
            if (currentPath.includes("/modules") || currentPath.includes("/#/modules")) {
              this.trackEvent(EventType.MODULE_LIST_VIEW, {
                url: window.location.href,
              })
            } else if (currentPath.includes("/results") || currentPath.includes("/#/results")) {
              this.trackEvent(EventType.RESULTS_VIEW, {
                url: window.location.href,
              })
            } else if (currentPath.includes("/profile") || currentPath.includes("/#/profile")) {
              this.trackEvent(EventType.PROFILE_VIEW, {
                url: window.location.href,
              })
            } else if (currentPath.includes("/bursary") || currentPath.includes("/#/bursary")) {
              this.trackEvent(EventType.BURSARY_VIEW, {
                url: window.location.href,
              })
            }
          }
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  private lastPath: string = window.location.pathname + window.location.hash

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
          moduleId: this.moduleId,
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
      moduleId: this.moduleId,
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
      moduleId: this.moduleId,
    })
  }

  private trackPageView(): void {
    // Determine page type based on URL
    let pageType = "unknown"
    const url = window.location.href

    if (url.includes("/login")) {
      pageType = "login"
    } else if (url.includes("/dashboard")) {
      pageType = "dashboard"
    } else if (url.includes("/modules")) {
      pageType = "modules"
    } else if (url.includes("/bursary")) {
      pageType = "bursary"
    } else if (url.includes("/resetpin")) {
      pageType = "resetpin"
    } else if (url.includes("/payments")) {
      pageType = "payments"
    } else if (url.includes("/results")) {
      pageType = "results"
    } else if (url.includes("/profile")) {
      pageType = "profile"
    } else if (url.includes("/contacts")) {
      pageType = "contacts"
    } else if (url.includes("/esadza")) {
      pageType = "esadza"
    } else if (url.includes("/re_sign_up")) {
      pageType = "signup"
    }

    this.trackEvent(EventType.PAGE_VIEW, {
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      moduleId: this.moduleId,
      pageType: pageType,
    })
  }

  private trackEvent(eventType: EventType, details: Record<string, any>): void {
    if (!this.isTracking) return

    const event: TrackingEvent = {
      eventType,
      url: window.location.href,
      path: window.location.pathname + window.location.hash,
      details,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      studentId: this.studentId,
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

