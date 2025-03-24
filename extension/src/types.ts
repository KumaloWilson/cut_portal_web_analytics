export interface StudentProfile {
  first_name: string
  surname: string
  student_id: string
  email_address: string
  programme_name?: string
  programme_code?: string
  faculty_name?: string
  level?: string
}

export interface Module {
  module_name: string
  module_id: string
  module_code: string
}

export interface TrackingEvent {
  event_type: string
  url: string
  path: string
  page_title: string
  timestamp: string
  session_id: string
  student_id?: string
  details?: Record<string, any>
}

export interface SessionData {
  session_id: string
  student_id?: string
  start_time: string
  last_activity: string
  is_active: boolean
  pages_visited: number
  total_time_spent: number // in seconds
}

export interface AnalyticsData {
  student?: StudentProfile
  modules?: Module[]
  current_session: SessionData
  events: TrackingEvent[]
}

