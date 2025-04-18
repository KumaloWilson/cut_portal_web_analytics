/**
 * Utility functions for anonymizing student data for exports
 */

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
export function anonymizeStudent(student: any): any {
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
export function anonymizeEvent(event: any): any {
  return {
    ...event,
    student_id: event.student_id ? anonymizeId(event.student_id) : null,
    // Keep other fields as they don't contain personal information
  }
}

// Anonymize a session object
export function anonymizeSession(session: any): any {
  return {
    ...session,
    student_id: session.student_id ? anonymizeId(session.student_id) : null,
    // Keep other fields as they don't contain personal information
  }
}

// Anonymize an array of data objects based on type
export function anonymizeData(data: any[], type: "students" | "events" | "sessions"): any[] {
  if (!data || !Array.isArray(data)) return []

  switch (type) {
    case "students":
      return data.map(anonymizeStudent)
    case "events":
      return data.map(anonymizeEvent)
    case "sessions":
      return data.map(anonymizeSession)
    default:
      return data
  }
}
