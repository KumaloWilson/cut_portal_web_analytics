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
    chrome.runtime.onMessage.addListener((message: { action: string; event: TrackingEvent; userId: string; userInfo: any; moduleId: string; moduleInfo: any; studentId: string; studentData: any; modules: any[] }, sender: { tab: { id: any; incognito: any; url: string } }, sendResponse: (arg0: { success: boolean }) => void) => {
      if (message.action === "trackEvent") {
        // Add IP address if available
        if (sender.tab && sender.tab.id) {
          message.event.ipAddress = sender.tab.incognito ? undefined : sender.tab.url?.split("/")[2] || undefined
        }

        this.queueEvent(message.event)
        sendResponse({ success: true })
      } else if (message.action === "updateUserInfo") {
        this.updateUserInfo(message.userId, message.userInfo)
        sendResponse({ success: true })
      } else if (message.action === "updateModuleInfo") {
        this.updateModuleInfo(message.moduleId, message.moduleInfo)
        sendResponse({ success: true })
      } else if (message.action === "updateStudentInfo") {
        this.updateStudentInfo(message.studentId, message.studentData)
        sendResponse({ success: true })
      } else if (message.action === "updateModulesList") {
        this.updateModulesList(message.studentId, message.modules)
        sendResponse({ success: true })
      }
      return true // Keep the message channel open for async response
    })

    // Listen for navigation events
    chrome.webNavigation.onCompleted.addListener((details: { url: string | string[]; tabId: any }) => {
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

  private async updateModuleInfo(moduleId: string, moduleInfo: any): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/modules/${moduleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moduleInfo),
      })

      if (!response.ok) {
        console.error("Failed to update module info:", response.statusText)
      }
    } catch (error) {
      console.error("Error updating module info:", error)
    }
  }

  private async updateStudentInfo(studentId: string, studentData: any): Promise<void> {
    try {
      // Extract relevant student information
      const studentInfo = {
        student_id: studentId,
        first_name: studentData.profile?.first_name || "",
        last_name: studentData.profile?.surname || "",
        email: studentData.profile?.email_address || "",
        phone: studentData.profile?.phone_numbers || "",
        national_id: studentData.profile?.national_id || "",
        date_of_birth: studentData.profile?.date_of_birth || "",
        gender: studentData.profile?.sex || "",
        program_code: studentData.registration?.program?.programme_code || "",
        program_name: studentData.registration?.program?.programme_name || "",
        faculty_code: studentData.registration?.program?.faculty_code || "",
        faculty_name: studentData.registration?.program?.faculty_name || "",
        level: studentData.registration?.program?.level || "",
        metadata: studentData,
      }

      const response = await fetch(`${this.API_URL}/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentInfo),
      })

      if (!response.ok) {
        console.error("Failed to update student info:", response.statusText)
      }
    } catch (error) {
      console.error("Error updating student info:", error)
    }
  }

  private async updateModulesList(studentId: string, modules: any[]): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/students/${studentId}/modules`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modules }),
      })

      if (!response.ok) {
        console.error("Failed to update modules list:", response.statusText)
      }
    } catch (error) {
      console.error("Error updating modules list:", error)
    }
  }
}

// Instantiate the BackgroundService class to use it
const backgroundService = new BackgroundService()

// Log that the background service has started
console.log("CUT eLearning Analytics background service started")

