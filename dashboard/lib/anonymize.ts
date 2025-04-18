/**
 * Utility functions for anonymizing student data for exports
 */

import { Student, EventType, Session, StudentEngagement } from "@/types"

// Generate a consistent but anonymous ID based on the original ID
export function anonymizeId(id: string): string {
  // Create a simple hash of the ID to maintain consistency
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Convert to a positive number and format as a string with prefix
  return `ANON-${Math.abs(hash).toString(16).padStart(8, "0")}`
}

// Anonymize a student object
export function anonymizeStudent(student: Student): Student {
  return {
    ...student,
    student_id: anonymizeId(student.student_id),
    first_name: "Student",
    surname: anonymizeId(student.student_id).substring(0, 8),
    email: `${anonymizeId(student.student_id).substring(0, 8)}@anonymous.edu`,
    // Keep non-personal fields
    programme_name: student.programme_name,
    programme_code: student.programme_code,
    faculty_name: student.faculty_name,
    level: student.level,
  }
}

// Anonymize an event object
export function anonymizeEvent(event: EventType): EventType {
  return {
    ...event,
    student_id: event.student_id ? anonymizeId(event.student_id) : null,
    // Keep other fields as they don't contain personal information
  }
}

// Anonymize a session object
export function anonymizeSession(session: Session): Session {
  return {
    ...session,
    student_id: session.student_id ? anonymizeId(session.student_id) : anonymizeId('unknown'),
    // Keep other fields as they don't contain personal information
  }
}

// Anonymize a student engagement object
export function anonymizeStudentEngagement(engagement: StudentEngagement): StudentEngagement {
  return {
    ...engagement,
    student_id: anonymizeId(engagement.student_id),
    first_name: "Student",
    surname: anonymizeId(engagement.student_id).substring(0, 8),
    // Keep non-personal statistical fields
    faculty_name: engagement.faculty_name,
    session_count: engagement.session_count,
    total_time_spent: engagement.total_time_spent,
    event_count: engagement.event_count
  }
}

// Type for the data arrays passed to anonymizeData function
type DataType<T> = T extends "students" 
  ? Student[]
  : T extends "events"
  ? EventType[]
  : T extends "sessions"
  ? Session[]
  : T extends "student_engagements"
  ? StudentEngagement[]
  : never;

// Type for the return value from anonymizeData
type AnonymizedData<T> = T extends "students" 
  ? Student[]
  : T extends "events"
  ? EventType[]
  : T extends "sessions"
  ? Session[]
  : T extends "student_engagements"
  ? StudentEngagement[]
  : never;

// Anonymize an array of data objects based on type
export function anonymizeData<T extends "students" | "events" |  "student_engagements" | "sessions">(
  data: DataType<T>, 
  type: T
): AnonymizedData<T> {
  if (!data || !Array.isArray(data)) return ([] as unknown) as AnonymizedData<T>

  switch (type) {
    case "students":
      return data.map(item => anonymizeStudent(item as Student)) as AnonymizedData<T>
    case "events":
      return data.map(item => anonymizeEvent(item as EventType)) as AnonymizedData<T>
    case "student_engagements":
      return data.map(item => anonymizeStudentEngagement(item as StudentEngagement)) as AnonymizedData<T>  
    
    case "sessions":
      return data.map(item => anonymizeSession(item as Session)) as AnonymizedData<T>
     default:
      return data as AnonymizedData<T>
  }
}