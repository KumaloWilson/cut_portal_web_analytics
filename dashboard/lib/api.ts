const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export interface ApiResponse<T> {
  data: T
  error?: string
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "An error occurred")
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    return {
      data: {} as T,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Define types
export type DashboardOverview = {}
export type Student = {}
export type Module = {}
export type Session = {}
export type Event = {}
export type ActivityData = {}
export type PageAnalytics = {}
export type StudentEngagement = {}
export type ModuleEngagement = {}
export type TimeOfDayActivity = {}

// Dashboard overview
export const getOverview = () => fetchApi<DashboardOverview>("/analytics/overview")

// Student data
export const getStudents = () => fetchApi<Student[]>("/students")
export const getStudent = (id: string) => fetchApi<Student>(`/students/${id}`)
export const getStudentModules = (id: string) => fetchApi<Module[]>(`/students/${id}/modules`)
export const getStudentSessions = (id: string) => fetchApi<Session[]>(`/sessions/student/${id}`)
export const getStudentEvents = (id: string, limit = 100, offset = 0) =>
  fetchApi<Event[]>(`/events/student/${id}?limit=${limit}&offset=${offset}`)

// Session data
export const getSessions = () => fetchApi<Session[]>("/sessions")
export const getSession = (id: string) => fetchApi<Session>(`/sessions/${id}`)
export const getSessionEvents = (id: string) => fetchApi<Event[]>(`/events/session/${id}`)
export const getActiveSessions = () => fetchApi<Session[]>("/sessions/active")

// Event data
export const getEvents = (limit = 100, offset = 0) => fetchApi<Event[]>(`/events?limit=${limit}&offset=${offset}`)
export const getRecentEvents = (minutes = 30, limit = 100) =>
  fetchApi<Event[]>(`/events/recent?minutes=${minutes}&limit=${limit}`)

// Analytics data
export const getActivityOverTime = (days = 30) => fetchApi<ActivityData[]>(`/analytics/activity?days=${days}`)
export const getTopPages = (limit = 10) => fetchApi<PageAnalytics[]>(`/analytics/pages?limit=${limit}`)
export const getStudentEngagement = () => fetchApi<StudentEngagement[]>("/analytics/engagement")
export const getModuleEngagement = () => fetchApi<ModuleEngagement[]>("/analytics/modules")
export const getTimeOfDayActivity = () => fetchApi<TimeOfDayActivity[]>("/analytics/time-of-day")

