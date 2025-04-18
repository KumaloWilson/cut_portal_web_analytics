import type {
  ActivityData,
  DashboardOverview,
  EventType,
  Module,
  ModuleEngagement,
  PageAnalytics,
  Session,
  Student,
  StudentEngagement,
  TimeOfDayActivity,
  DailyVisitorStats,
} from "@/types"
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"

// Base URL configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"


export const API_BASE_URL =  "http://localhost:5000/api"

// Custom error class for API errors
class ApiError extends Error {
  status?: number
  details?: any

  constructor(message: string, status?: number, details?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }

    // Transform axios error into our custom ApiError
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new ApiError(error.message || "An error occurred", error.response.status, error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      throw new ApiError("No response received from server", 0)
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new ApiError("Error setting up the request", 0)
    }
  },
)

// Generic API response type
export interface ApiResponse<T> {
  data: T
}

// Utility function for making API requests
async function fetchApi<T>(
  endpoint: string,
  method: "get" | "post" | "put" | "delete" | "patch" = "get",
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    let response: AxiosResponse<T>

    switch (method) {
      case "post":
        response = await apiClient.post<T>(endpoint, data, config)
        break
      case "put":
        response = await apiClient.put<T>(endpoint, data, config)
        break
      case "delete":
        response = await apiClient.delete<T>(endpoint, config)
        break
      case "patch":
        response = await apiClient.patch<T>(endpoint, data, config)
        break
      default:
        response = await apiClient.get<T>(endpoint, config)
    }

    return response.data
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error (${endpoint}):`, error.message, error.details)
      throw error
    }

    console.error(`Unexpected error (${endpoint}):`, error)
    throw new ApiError("An unexpected error occurred", 500)
  }
}

// Dashboard overview
export const getOverview = () => fetchApi<DashboardOverview>("/analytics/overview")

// Daily visitors
export const getDailyVisitors = () => fetchApi<DailyVisitorStats>("/analytics/daily-visitors")

// Student data
export const getStudents = () => fetchApi<Student[]>("/students")
export const getStudent = (id: string) => fetchApi<Student>(`/students/${id}`)
export const getStudentModules = (id: string) => fetchApi<Module[]>(`/students/${id}/modules`)
export const getStudentSessions = (id: string) => fetchApi<Session[]>(`/sessions/student/${id}`)
export const getStudentEvents = (id: string, limit = 100, offset = 0) =>
  fetchApi<EventType[]>(`/events/student/${id}?limit=${limit}&offset=${offset}`)

// Session data
export const getSessions = () => fetchApi<Session[]>("/sessions")
export const getSession = (id: string) => fetchApi<Session>(`/sessions/${id}`)
export const getSessionEvents = (id: string) => fetchApi<EventType[]>(`/events/session/${id}`)
export const getActiveSessions = () => fetchApi<Session[]>("/sessions/active")

// Event data
export const getEvents = (limit = 100, offset = 0) => fetchApi<EventType[]>(`/events?limit=${limit}&offset=${offset}`)
export const getRecentEvents = (minutes = 30, limit = 100) =>
  fetchApi<EventType[]>(`/events/recent?minutes=${minutes}&limit=${limit}`)

// Analytics data
export const getActivityOverTime = (days = 30) => fetchApi<ActivityData[]>(`/analytics/activity?days=${days}`)
export const getTopPages = (limit = 10) => fetchApi<PageAnalytics[]>(`/analytics/pages?limit=${limit}`)
export const getStudentEngagement = () => fetchApi<StudentEngagement[]>("/analytics/engagement")
export const getModuleEngagement = () => fetchApi<ModuleEngagement[]>("/analytics/modules")
export const getTimeOfDayActivity = () => fetchApi<TimeOfDayActivity[]>("/analytics/time-of-day")

// Export data
export const exportStudents = (format = "excel") => {
  window.open(`${API_BASE_URL}/export/students?format=${format}`, "_blank")
}

export const exportEvents = (format = "excel", studentId?: string, limit = 1000) => {
  let url = `${API_BASE_URL}/export/events?format=${format}&limit=${limit}`
  if (studentId) {
    url += `&studentId=${studentId}`
  }
  window.open(url, "_blank")
}

export const exportSessions = (format = "excel", studentId?: string) => {
  let url = `${API_BASE_URL}/export/sessions?format=${format}`
  if (studentId) {
    url += `&studentId=${studentId}`
  }
  window.open(url, "_blank")
}

// Authentication
export const login = (email: string, password: string) =>
  fetchApi<{ token: string; admin: any }>("/auth/login", "post", { email, password })

export const registerAdmin = (username: string, email: string, password: string) =>
  fetchApi<{ admin: any }>("/auth/register", "post", { username, email, password })

export const getCurrentAdmin = () => fetchApi<{ admin: any }>("/auth/me")



/**
 * Fetches the analytics overview data
 * @returns Dashboard overview data including counts and stats
 */
export const fetchAnalytics = (): Promise<DashboardOverview> => {
  return fetchApi<DashboardOverview>("/analytics/overview")
}

/**
 * Fetches student engagement metrics
 * @returns Array of student engagement data
 */
export const fetchStudentEngagement = (): Promise<StudentEngagement[]> => {
  return fetchApi<StudentEngagement[]>("/analytics/engagement")
}

/**
 * Fetches module engagement metrics
 * @returns Array of module engagement data
 */
export const fetchModuleEngagement = (): Promise<ModuleEngagement[]> => {
  return fetchApi<ModuleEngagement[]>("/analytics/modules")
}

/**
 * Fetches event distribution by time of day
 * @returns Time of day activity data
 */
export const fetchEventDistribution = (): Promise<TimeOfDayActivity[]> => {
  return fetchApi<TimeOfDayActivity[]>("/analytics/time-of-day")
}

/**
 * Fetches activity data over a specified time period
 * @param days Number of days to include in the report (default: 30)
 * @returns Array of activity data points
 */
export const fetchActivityOverTime = (days = 30): Promise<ActivityData[]> => {
  return fetchApi<ActivityData[]>(`/analytics/activity?days=${days}`)
}

/**
 * Fetches top visited pages
 * @param limit Maximum number of pages to return (default: 10)
 * @returns Array of page analytics
 */
export const fetchTopPages = (limit = 10): Promise<PageAnalytics[]> => {
  return fetchApi<PageAnalytics[]>(`/analytics/pages?limit=${limit}`)
}

/**
 * Fetches daily visitor statistics
 * @returns Daily visitor stats including today, yesterday, and trends
 */
export const fetchDailyVisitors = (): Promise<DailyVisitorStats> => {
  return fetchApi<DailyVisitorStats>("/analytics/daily-visitors")
}

/**
 * Exports analytics data to the specified format
 * @param endpoint The export endpoint
 * @param format Export format (default: "excel")
 */
export const exportAnalyticsData = (endpoint: string, format = "excel") => {
  window.open(`${API_BASE_URL}/export/${endpoint}?format=${format}`, "_blank")
}

/**
 * Utility function for downloading analytics charts as images
 * @param chartId The ID of the chart element to download
 * @param filename The name of the file to download
 */
export const downloadChartAsImage = (chartId: string, filename: string) => {
  const canvas = document.getElementById(chartId) as HTMLCanvasElement
  if (canvas) {
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
}



// Export the custom error class and axios instance for advanced use cases
export { ApiError, apiClient }
