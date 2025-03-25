// Student types
export interface Student {
    id: number
    student_id: string
    first_name: string
    surname: string
    email: string
    programme_name: string
    programme_code: string
    faculty_name: string
    level: string
    created_at: string
    updated_at: string
  }
  
  // Module types
  export interface Module {
    id: number
    module_id: string
    module_name: string
    module_code: string
    created_at: string
  }
  
  // Session types
  export interface Session {
    id: number
    session_id: string
    student_id: string
    start_time: string
    end_time: string | null
    total_time_spent: number | null
    pages_visited: number | null
    user_agent: string | null
    created_at: string
  }
  
  // Event types
  export interface EventType {
    id: number
    event_type: string
    session_id: string
    student_id: string | null
    url: string
    path: string
    page_title: string | null
    timestamp: string
    details: Record<string, any> | null
    created_at: string
  }
  
  // Analytics types
  export interface DashboardOverview {
    total_students: number
    total_sessions: number
    total_events: number
    avg_session_time: number
    top_pages: PageAnalytics[]
    active_sessions: number
    recent_events: number
  }
  
  export interface ActivityData {
    date: string
    sessions: number
    page_views: number
    interactions: number
  }
  
  export interface PageAnalytics {
    page_path: string
    page_title: string | null
    view_count: number
  }
  
  export interface StudentEngagement {
    student_id: string
    first_name: string
    surname: string
    session_count: number
    total_time_spent: number
    event_count: number
  }
  
  export interface ModuleEngagement {
    module_id: string
    module_name: string
    module_code: string
    student_count: number
    event_count: number
  }
  
  export interface TimeOfDayActivity {
    hour: number
    event_count: number
  }
  
  // Real-time update types
  export interface RealtimeUpdate<T> {
    type: string
    data: T
    timestamp: string
  }
  
  