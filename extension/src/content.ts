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
const API_ENDPOINT =  "https://cutanalyticsapi.onrender.com/api" //"http://localhost:3000/api"

// Declare chrome if it's not available globally
declare const chrome: any

// Check if student is logged in by monitoring localStorage
function checkLoginStatus() {
  try {
    const currentStudentData = localStorage.getItem("currentStudent")
    if (currentStudentData) {
      // Student is logged in, extract profile
      const studentProfile = extractStudentProfile()

      if (studentProfile && studentProfile.student_id) {
        // Track login event
        trackEvent("login_detected", {
          student_id: studentProfile.student_id,
          timestamp: new Date().toISOString(),
        })

        // Update analytics data with student info
        analyticsData.student = studentProfile
        analyticsData.modules = extractModules()
        saveAnalyticsData()

        // Send student data to API to create/update student record
        sendToAPI("/students", studentProfile)

        // If modules are available, send them to API
        if (analyticsData.modules && analyticsData.modules.length > 0) {
          sendToAPI(`/students/${studentProfile.student_id}/modules`, {
            modules: analyticsData.modules,
            period_id: new Date().toISOString().split("T")[0], // Use current date as period ID
          })
        }

        console.log("Student logged in:", studentProfile.first_name, studentProfile.surname)
        return true
      }
    }
    return false
  } catch (error) {
    console.error("Error checking login status:", error)
    return false
  }
}

// Safely extract student profile with error handling
function safeExtractStudentProfile() {
  try {
    return extractStudentProfile()
  } catch (error) {
    console.warn("Failed to extract student profile:", error)
    return null
  }
}

// Safely extract modules with error handling
function safeExtractModules() {
  try {
    return extractModules()
  } catch (error) {
    console.warn("Failed to extract modules:", error)
    return []
  }
}

// Initialize tracking
function initializeTracking() {
  // Check if we already have a session
  chrome.storage.local.get(["analyticsData"], (result: { analyticsData?: AnalyticsData }) => {
    if (result.analyticsData) {
      analyticsData = result.analyticsData

      // Check if session is still valid (less than 30 minutes old)
      const lastActivity = new Date(analyticsData.current_session.last_activity || new Date().toISOString())
      const now = new Date()
      const timeDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60) // in minutes

      if (timeDiff > 30 || !analyticsData.current_session.is_active) {
        // Create new session
        createNewSession()
      } else {
        // Update last activity
        analyticsData.current_session.last_activity = new Date().toISOString()
        analyticsData.current_session.pages_visited = (analyticsData.current_session.pages_visited || 0) + 1
        saveAnalyticsData()
      }
    } else {
      // Create new session
      createNewSession()
    }

    // Check login status
    checkLoginStatus()

    // Track page view
    trackEvent("page_view")
  })
}

// Create a new session
function createNewSession() {
  const sessionId = generateSessionId()
  const now = new Date().toISOString()

  // Try to extract student profile safely
  const studentProfile = safeExtractStudentProfile()

  analyticsData = {
    student: studentProfile || undefined,
    modules: safeExtractModules(),
    current_session: {
      session_id: sessionId,
      student_id: studentProfile?.student_id,
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
  try {
    const pageInfo = getCurrentPageInfo()
    const { path, title } = pageInfo || { path: window.location.pathname, title: document.title }
    const timestamp = new Date().toISOString()

    const event: TrackingEvent = {
      event_type: eventType,
      url: window.location.href,
      path,
      page_title: title,
      timestamp,
      session_id: analyticsData.current_session?.session_id || "",
      student_id: analyticsData.student?.student_id,
      details,
    }

    // Add to local events
    analyticsData.events = analyticsData.events || []
    analyticsData.events.push(event)

    // Update session data
    if (analyticsData.current_session) {
      analyticsData.current_session.last_activity = timestamp
      if (analyticsData.current_session.start_time) {
        analyticsData.current_session.total_time_spent = getTimeDifference(
          analyticsData.current_session.start_time,
          timestamp,
        )
      }
    }

    saveAnalyticsData()

    // Send to API immediately for real-time tracking
    chrome.runtime.sendMessage({
      type: "track_event",
      event: event,
    })
  } catch (error) {
    console.error("Error tracking event:", error)
  }
}

// Save analytics data to chrome storage
function saveAnalyticsData() {
  try {
    chrome.storage.local.set({ analyticsData })
  } catch (error) {
    console.error("Error saving analytics data:", error)
  }
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
    try {
      const failedRequests = JSON.parse(localStorage.getItem("failedRequests") || "[]")
      failedRequests.push({ endpoint, data, timestamp: new Date().toISOString() })
      localStorage.setItem("failedRequests", JSON.stringify(failedRequests))
    } catch (storageError) {
      console.error("Error storing failed request:", storageError)
    }
  })
}

// Set up event listeners
function setupEventListeners() {
  try {
    // Track clicks
    document.addEventListener("click", (event) => {
      try {
        const target = event.target as HTMLElement

        // Track button clicks
        if (target.tagName === "BUTTON" || target.tagName === "A" || target.closest("button") || target.closest("a")) {
          const element =
            target.tagName === "BUTTON" || target.tagName === "A"
              ? target
              : target.closest("button") || target.closest("a")

          if (element) {
            trackEvent("click", {
              element_type: element.tagName.toLowerCase(),
              element_text: element.textContent?.trim() || "",
              element_id: element.id || "",
              element_class: element.className || "",
            })
          }
        }
      } catch (error) {
        console.error("Error handling click event:", error)
      }
    })

    // Track form submissions
    document.addEventListener("submit", (event) => {
      try {
        const form = event.target as HTMLFormElement

        // Check if this is a login form
        const isLoginForm =
          form.action &&
          (form.action.includes("login") || form.action.includes("signin") || form.action.includes("auth"))

        if (isLoginForm) {
          // Set a timeout to check for login after form submission
          setTimeout(() => {
            const loggedIn = checkLoginStatus()
            if (loggedIn) {
              console.log("Login detected after form submission")
            }
          }, 2000) // Check after 2 seconds to allow for page load
        }

        trackEvent("form_submit", {
          form_id: form.id || "",
          form_action: form.action || "",
          is_login_form: isLoginForm,
        })
      } catch (error) {
        console.error("Error handling form submit event:", error)
      }
    })

    // Track file downloads
    document.addEventListener("click", (event) => {
      try {
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
      } catch (error) {
        console.error("Error handling download click event:", error)
      }
    })

    // Track page unload
    window.addEventListener("beforeunload", () => {
      try {
        // Calculate final session time
        const endTime = new Date().toISOString()
        if (analyticsData.current_session && analyticsData.current_session.start_time) {
          analyticsData.current_session.total_time_spent = getTimeDifference(
            analyticsData.current_session.start_time,
            endTime,
          )
        }

        // Track page exit
        trackEvent("page_exit")

        // Update session status
        if (analyticsData.current_session) {
          analyticsData.current_session.is_active = false
          analyticsData.current_session.last_activity = endTime
        }

        saveAnalyticsData()

        // Send session update to API
        sendToAPI("/sessions/update", {
          session_id: analyticsData.current_session?.session_id,
          end_time: endTime,
          total_time_spent: analyticsData.current_session?.total_time_spent,
          pages_visited: analyticsData.current_session?.pages_visited,
        })
      } catch (error) {
        console.error("Error handling beforeunload event:", error)
      }
    })

    // Track visibility change
    document.addEventListener("visibilitychange", () => {
      try {
        if (document.visibilityState === "hidden") {
          trackEvent("tab_hidden")
        } else {
          trackEvent("tab_visible")

          // Check login status when tab becomes visible again
          checkLoginStatus()
        }
      } catch (error) {
        console.error("Error handling visibility change event:", error)
      }
    })

    // Monitor localStorage changes to detect login/logout
    const originalSetItem = localStorage.setItem
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value])

      // If currentStudent is being set, check login status
      if (key === "currentStudent") {
        setTimeout(() => {
          checkLoginStatus()
        }, 100)
      }
    }
  } catch (error) {
    console.error("Error setting up event listeners:", error)
  }
}

// Retry failed requests
function retryFailedRequests() {
  try {
    const failedRequestsJson = localStorage.getItem("failedRequests") || "[]"
    const failedRequests = JSON.parse(failedRequestsJson)
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
  } catch (error) {
    console.error("Error retrying failed requests:", error)
  }
}

// Check if we're on login or signup page
function isAuthPage() {
  const path = window.location.pathname.toLowerCase()
  return path.includes("login") || path.includes("signin") || path.includes("re_sign_up") || path.includes("signup")
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Check login status first
    const isLoggedIn = checkLoginStatus()
    console.log("Login status check on page load:", isLoggedIn ? "Logged in" : "Not logged in")

    // Only initialize full tracking if not on auth pages
    if (!isAuthPage()) {
      initializeTracking()
      setupEventListeners()
      retryFailedRequests()

      // Set up interval to retry failed requests
      setInterval(retryFailedRequests, 5 * 60 * 1000) // Every 5 minutes
    } else {
      // For auth pages, only track minimal info without requiring student data
      trackEvent("auth_page_view", { page_type: window.location.pathname.includes("login") ? "login" : "signup" })

      // Set up event listeners specifically for login forms
      setupEventListeners()
    }
  } catch (error) {
    console.error("Error during initialization:", error)
  }
})

// Initialize immediately for SPA navigation, with error handling
try {
  if (!isAuthPage()) {
    initializeTracking()
    setupEventListeners()
  } else {
    // For auth pages, set up login form tracking
    setupEventListeners()
  }
} catch (error) {
  console.error("Error during SPA initialization:", error)
}

