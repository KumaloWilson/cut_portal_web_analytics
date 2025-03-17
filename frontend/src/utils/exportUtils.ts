import * as XLSX from "xlsx"

interface ExportData {
  sheetName: string
  data: any[]
}

export const exportToExcel = (data: ExportData[], fileName: string): void => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Add each sheet to the workbook
    data.forEach((sheet) => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data)
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName)
    })

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  } catch (error) {
    console.error("Error exporting data to Excel:", error)
    alert("Failed to export data. Please try again.")
  }
}

export const exportToCSV = (data: any[], fileName: string): void => {
  try {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Create a new workbook with a single sheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

    // Generate CSV file and trigger download
    XLSX.writeFile(workbook, `${fileName}.csv`)
  } catch (error) {
    console.error("Error exporting data to CSV:", error)
    alert("Failed to export data. Please try again.")
  }
}

