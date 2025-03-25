import type { StudentProfile, Module } from "./types"

// Generate a unique session ID
export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Extract student profile from localStorage
export function extractStudentProfile(): StudentProfile | null {
  try {
    const currentStudent = localStorage.getItem("currentStudent")
    if (!currentStudent) return null

    const data = JSON.parse(currentStudent)

    // Extract profile data from the structure shown in the example
    const profile = data.profile || {}
    const registration = data.registration || {}
    const program = registration.program || {}

    return {
      first_name: profile.first_name || "",
      surname: profile.surname || "",
      student_id: profile.student_id || "",
      email_address: profile.email_address || "",
      programme_name: program.programme_name || "",
      programme_code: program.programme_code || "",
      faculty_name: program.faculty_name || "",
      level: program.level || "",
    }
  } catch (error) {
    console.error("Error extracting student profile:", error)
    return null
  }
}

// Extract modules from localStorage
export function extractModules(): Module[] {
  try {
    const currentStudent = localStorage.getItem("currentStudent")
    if (!currentStudent) return []

    const data = JSON.parse(currentStudent)
    const registration = data.registration || {}
    const modules = registration.modules || []

    return modules.map((module: any) => ({
      module_name: module.module_name || "",
      module_id: module.module_id || "",
      module_code: module.module_code || "",
    }))
  } catch (error) {
    console.error("Error extracting modules:", error)
    return []
  }
}

// Get current page info
export function getCurrentPageInfo(): { path: string; title: string } {
  const path = window.location.pathname + window.location.hash
  const title = document.title
  return { path, title }
}

// Calculate time difference in seconds
export function getTimeDifference(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  return Math.floor((end - start) / 1000)
}

// Map URL to page type
export function getPageType(url: string): string {
  const urlObj = new URL(url)
  const path = urlObj.pathname + urlObj.hash

  if (path.includes("/login")) return "login"
  if (path.includes("/dashboard")) return "dashboard"
  if (path.includes("/modules")) return "modules"
  if (path.includes("/bursary")) return "bursary"
  if (path.includes("/payments")) return "payments"
  if (path.includes("/results")) return "results"
  if (path.includes("/profile")) return "profile"
  if (path.includes("/contacts")) return "contacts"
  if (path.includes("/esadza")) return "esadza"
  if (path.includes("/resetpin")) return "resetpin"
  if (path.includes("/re_sign_up")) return "signup"
  if (path.includes("/vle")) return "vle"

  return "other"
}

