import type { TrackingEvent } from "../types/events"
import axios, { AxiosError, AxiosInstance } from "axios"

// Declare chrome as a global variable to avoid Typescript errors
declare const chrome: any

class BackgroundService {
  private readonly API_URL = "http://localhost:3000/api"
  private queue: TrackingEvent[] = []
  private isSending = false
  private flushInterval = 5000 // 5 seconds
  private apiClient: AxiosInstance
  private maxRetries = 3
  private retryDelay = 2000 // 2 seconds

  constructor() {
    // Initialize axios instance with default configuration
    this.apiClient = axios.create({
      baseURL: this.API_URL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        "Content-Type": "application/json"
      }
    })
    
    // Add response interceptor for global error handling
    this.apiClient.interceptors.response.use(
      response => response,
      this.handleAxiosError.bind(this)
    )
    
    this.initializeListeners()
    this.setupPeriodicFlush()
    
    console.log("BackgroundService initialized with Axios")
  }

  private handleAxiosError(error: AxiosError): Promise<never> {
    if (error.response) {
      // Server responded with an error status code
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`, 
        error.config?.url || "unknown endpoint")
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error: No response received", error.config?.url || "unknown endpoint")
    } else {
      // Error in setting up the request
      console.error("Request Error:", error.message)
    }
    
    return Promise.reject(error)
  }

  private async retryOperation<T>(
    operation: () => Promise<T>, 
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries <= 0) throw error
      
      console.log(`Retrying operation in ${this.retryDelay}ms... (${retries} attempts left)`)
      await new Promise(resolve => setTimeout(resolve, this.retryDelay))
      return this.retryOperation(operation, retries - 1)
    }
  }

  private initializeListeners(): void {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message: { 
      action: string; 
      event: TrackingEvent; 
      userId: string; 
      userInfo: any; 
      moduleId: string; 
      moduleInfo: any; 
      studentId: string; 
      studentData: any; 
      modules: any[] 
    }, sender: { 
      tab: { 
        id: any; 
        incognito: any; 
        url: string 
      } 
    }, sendResponse: (arg0: { 
      success: boolean,
      error?: string 
    }) => void) => {
      try {
        if (message.action === "trackEvent") {
          // Add IP address if available
          if (sender.tab && sender.tab.id) {
            message.event.ipAddress = sender.tab.incognito ? undefined : sender.tab.url?.split("/")[2] || undefined
          }

          this.queueEvent(message.event)
          sendResponse({ success: true })
        } else if (message.action === "updateUserInfo") {
          if (!message.userId) {
            sendResponse({ success: false, error: "Invalid userId" })
            return true
          }
          this.updateUserInfo(message.userId, message.userInfo)
          sendResponse({ success: true })
        } else if (message.action === "updateModuleInfo") {
          if (!message.moduleId) {
            sendResponse({ success: false, error: "Invalid moduleId" })
            return true
          }
          this.updateModuleInfo(message.moduleId, message.moduleInfo)
          sendResponse({ success: true })
        } else if (message.action === "updateStudentInfo") {
          if (!message.studentId) {
            sendResponse({ success: false, error: "Invalid studentId" })
            return true
          }
          this.updateStudentInfo(message.studentId, message.studentData)
          sendResponse({ success: true })
        } else if (message.action === "updateModulesList") {
          if (!message.studentId || !Array.isArray(message.modules)) {
            sendResponse({ success: false, error: "Invalid studentId or modules data" })
            return true
          }
          this.updateModulesList(message.studentId, message.modules)
          sendResponse({ success: true })
        } else {
          // Unknown action
          sendResponse({ success: false, error: `Unknown action: ${message.action}` })
        }
      } catch (error) {
        console.error(`Error handling message ${message.action}:`, error)
        sendResponse({ success: false, error: `Internal error processing ${message.action}` })
      }
      
      return true // Keep the message channel open for async response
    })

    // Listen for navigation events
    chrome.webNavigation.onCompleted.addListener((details: { url: string | string[]; tabId: any }) => {
      if (details.url && typeof details.url === 'string' && details.url.includes("elearning.cut.ac.zw")) {
        chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          files: ["content.js"],
        }).catch((error: any) => {
          console.error("Error injecting content script:", error)
        })
      }
    })
  }

  private queueEvent(event: TrackingEvent): void {
    // Validate event data before queueing
    if (!event || typeof event !== 'object') {
      console.error("Invalid event data:", event)
      return
    }
    
    this.queue.push(event)
    console.log(`Event queued. Queue size: ${this.queue.length}`)

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
      await this.retryOperation(async () => {
        const response = await this.apiClient.post("/events/batch", { events: eventsToSend })
        console.log(`Successfully sent ${eventsToSend.length} events`)
        return response
      })
    } catch (error) {
      // If sending fails after retries, add events back to the queue
      this.queue = [...eventsToSend, ...this.queue]
      console.error("Failed to send events after retries:", error)
    } finally {
      this.isSending = false
    }
  }

  private async updateUserInfo(userId: string, userInfo: any): Promise<void> {
    if (!userId || !userInfo) {
      console.log("Skipping user info update: Invalid data")
      return
    }
    
    try {
      await this.retryOperation(() => 
        this.apiClient.put(`/users/${userId}`, userInfo)
      )
      console.log(`Successfully updated user info for ${userId}`)
    } catch (error) {
      console.error(`Failed to update user info for ${userId}:`, error)
    }
  }

  private async updateModuleInfo(moduleId: string, moduleInfo: any): Promise<void> {
    if (!moduleId || !moduleInfo) {
      console.log("Skipping module info update: Invalid data")
      return
    }
    
    try {
      await this.retryOperation(() => 
        this.apiClient.put(`/modules/${moduleId}`, moduleInfo)
      )
      console.log(`Successfully updated module info for ${moduleId}`)
    } catch (error) {
      console.error(`Failed to update module info for ${moduleId}:`, error)
    }
  }
  
  private async updateStudentInfo(studentId: string, studentData: any): Promise<void> {
    // Skip update if studentId is invalid or studentData is null/empty
    if (!studentId || !studentData || Object.keys(studentData).length === 0) {
      console.log("Skipping student info update: Invalid student data")
      return
    }
  
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
  
      await this.retryOperation(() => 
        this.apiClient.put(`/students/${studentId}`, studentInfo)
      )
      console.log(`Successfully updated student info for ${studentId}`)
    } catch (error) {
      console.error(`Failed to update student info for ${studentId}:`, error)
    }
  }
  
  private async updateModulesList(studentId: string, modules: any[]): Promise<void> {
    if (!studentId || !modules || !Array.isArray(modules)) {
      console.log("Skipping modules list update: Invalid data")
      return
    }
    
    try {
      await this.retryOperation(() => 
        this.apiClient.put(`/students/${studentId}/modules`, { modules })
      )
      console.log(`Successfully updated modules list for student ${studentId}`)
    } catch (error) {
      console.error(`Failed to update modules list for student ${studentId}:`, error)
    }
  }
}

// Instantiate the BackgroundService class to use it
const backgroundService = new BackgroundService()

// Log that the background service has started
console.log("CUT eLearning Analytics background service started")