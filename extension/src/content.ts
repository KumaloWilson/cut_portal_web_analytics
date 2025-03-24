import type { TrackingEvent, AnalyticsData } from "./types"
import {
  generateSessionId,
  extractStudentProfile,
  extractModules,
  getCurrentPageInfo,
  getTimeDifference,
} from "./utils"

// Initialize analytics data
let analyticsData: AnalyticsData = {
  current_session: {
    session_id: "",
    start_time: "",
    last_activity: "",
    is_active: false,
    pages_visited: 0,
    total_time_spent: 0,
  },
  events: [],
}

// API endpoint
const API_ENDPOINT = "http://localhost:3000/api"

// Declare chrome if it's not available globally
declare const chrome: any

// Initialize tracking
function initializeTracking() {
  // Check if we already have a session
  chrome.storage.local.get(["analyticsData"], (result: { analyticsData: AnalyticsData }) => {
    if (result.analyticsData) {
      analyticsData = result.analyticsData

      // Check if session is still valid (less than 30 minutes old)
      const lastActivity = new Date(analyticsData.current_session.last_activity)
      const now = new Date()
      const timeDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60) // in minutes

      if (timeDiff > 30 || !analyticsData.current_session.is_active) {
        // Create new session
        createNewSession()
      } else {
        // Update last activity
        analyticsData.current_session.last_activity = new Date().toISOString()
        analyticsData.current_session.pages_visited++
        saveAnalyticsData()
      }
    } else {
      // Create new session
      createNewSession()
    }

    // Track page view
    trackEvent("page_view")
  })
}

// Create a new session
function createNewSession() {
  const sessionId = generateSessionId()
  const now = new Date().toISOString()

  analyticsData = {
    student: extractStudentProfile() || undefined,
    modules: extractModules(),
    current_session: {
      session_id: sessionId,
      student_id: analyticsData.student?.student_id,
      start_time: now,
      last_activity: now,
      is_active: true,
      pages_visited: 1,
      total_time_spent: 0,
    },
    events: [],
  }

  saveAnalyticsData()

  // Send session start to API
  sendToAPI("/sessions", {
    session_id: sessionId,
    student_id: analyticsData.student?.student_id,
    start_time: now,
    user_agent: navigator.userAgent,
  })
}

// Track an event
function trackEvent(eventType: string, details: Record<string, any> = {}) {
  const { path, title } = getCurrentPageInfo()
  const timestamp = new Date().toISOString()

  const event: TrackingEvent = {
    event_type: eventType,
    url: window.location.href,
    path,
    page_title: title,
    timestamp,
    session_id: analyticsData.current_session.session_id,
    student_id: analyticsData.student?.student_id,
    details,
  }

  // Add to local events
  analyticsData.events.push(event)

  // Update session data
  analyticsData.current_session.last_activity = timestamp
  if (analyticsData.current_session.start_time) {
    analyticsData.current_session.total_time_spent = getTimeDifference(
      analyticsData.current_session.start_time,
      timestamp,
    )
  }

  saveAnalyticsData()

  // Send to API immediately for real-time tracking
  chrome.runtime.sendMessage({
    type: "track_event",
    event: event,
  })
}

// Save analytics data to chrome storage
function saveAnalyticsData() {
  chrome.storage.local.set({ analyticsData })
}

// Send data to API
function sendToAPI(endpoint: string, data: any) {
  fetch(`${API_ENDPOINT}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch((error) => {
    console.error("Error sending data to API:", error)
    // Store failed requests for later retry
    const failedRequests = JSON.parse(localStorage.getItem("failedRequests") || "[]")
    failedRequests.push({ endpoint, data, timestamp: new Date().toISOString() })
    localStorage.setItem("failedRequests", JSON.stringify(failedRequests))
  })
}

// Set up event listeners
function setupEventListeners() {
  // Track clicks
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement

    // Track button clicks
    if (target.tagName === "BUTTON" || target.tagName === "A" || target.closest("button") || target.closest("a")) {
      const element =
        target.tagName === "BUTTON" || target.tagName === "A" ? target : target.closest("button") || target.closest("a")

      if (element) {
        trackEvent("click", {
          element_type: element.tagName.toLowerCase(),
          element_text: element.textContent?.trim() || "",
          element_id: element.id || "",
          element_class: element.className || "",
        })
      }
    }
  })

  // Track form submissions
  document.addEventListener("submit", (event) => {
    const form = event.target as HTMLFormElement
    trackEvent("form_submit", {
      form_id: form.id || "",
      form_action: form.action || "",
    })
  })

  // Track file downloads
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement
    const link = target.tagName === "A" ? target : target.closest("a")

    if (link && (link as HTMLAnchorElement).href) {
      const href = (link as HTMLAnchorElement).href
      const fileExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip"]

      if (fileExtensions.some((ext) => href.toLowerCase().endsWith(ext))) {
        trackEvent("file_download", {
          file_url: href,
          file_name: href.split("/").pop() || "",
        })
      }
    }
  })

  // Track page unload
  window.addEventListener("beforeunload", () => {
    // Calculate final session time
    const endTime = new Date().toISOString()
    analyticsData.current_session.total_time_spent = getTimeDifference(
      analyticsData.current_session.start_time,
      endTime,
    )

    // Track page exit
    trackEvent("page_exit")

    // Update session status
    analyticsData.current_session.is_active = false
    analyticsData.current_session.last_activity = endTime

    saveAnalyticsData()

    // Send session update to API
    sendToAPI("/sessions/update", {
      session_id: analyticsData.current_session.session_id,
      end_time: endTime,
      total_time_spent: analyticsData.current_session.total_time_spent,
      pages_visited: analyticsData.current_session.pages_visited,
    })
  })

  // Track visibility change
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      trackEvent("tab_hidden")
    } else {
      trackEvent("tab_visible")
    }
  })
}

// Retry failed requests
function retryFailedRequests() {
  const failedRequests = JSON.parse(localStorage.getItem("failedRequests") || "[]")
  if (failedRequests.length === 0) return

  const newFailedRequests: any[] = []

  for (const request of failedRequests) {
    fetch(`${API_ENDPOINT}${request.endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.data),
    }).catch((error) => {
      console.error("Error retrying request:", error)
      newFailedRequests.push(request)
    })
  }

  localStorage.setItem("failedRequests", JSON.stringify(newFailedRequests))
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeTracking()
  setupEventListeners()
  retryFailedRequests()

  // Set up interval to retry failed requests
  setInterval(retryFailedRequests, 5 * 60 * 1000) // Every 5 minutes
})

// Initialize immediately for SPA navigation
initializeTracking()
setupEventListeners()

