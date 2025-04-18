import { Student, EventType, Session, StudentEngagement } from "@/types"
import { anonymizeData } from "./anonymize"

/**
 * Convert an array of objects to CSV format
 */
export function objectsToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (!data || data.length === 0) return ""

  // Get headers from the first object
  const headers = Object.keys(data[0])

  // Create CSV header row
  const csvRows = [headers.join(",")]

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      // Handle different data types
      if (value === null || value === undefined) return ""
      if (typeof value === "object") return JSON.stringify(value).replace(/,/g, ";")
      return String(value).replace(/,/g, ";") // Replace commas in values to avoid CSV issues
    })
    csvRows.push(values.join(","))
  }

  return csvRows.join("\n")
}

type DataType = "students" | "events" | "sessions"

/**
 * Export data to CSV with anonymization
 */
export function exportToCSV<T extends Student | EventType | Session | StudentEngagement>(
  data: T extends Student ? Student[] : T extends EventType ? EventType[] : T extends StudentEngagement ? StudentEngagement[] : Session[], 
  type: DataType, 
  filename: string
): void {
  // Anonymize the data
  const anonymizedData = anonymizeData(data, type)

  // Convert to CSV
  const csv = objectsToCSV(anonymizedData as unknown as Record<string, unknown>[])

  // Create a blob and download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  // Create a link element and trigger download
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}