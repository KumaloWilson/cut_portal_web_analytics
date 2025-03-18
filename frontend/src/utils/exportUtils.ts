import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

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

export const exportToPDF = (data: any[], fileName: string, p0: string): void => {
  try {
    // Create a new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(16)
    doc.text(fileName, 14, 22)

    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

    // Extract headers and rows for the table
    const headers = Object.keys(data[0])
    const rows = data.map((item) => Object.values(item)) as string[][]

    // Add the table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 35,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { top: 35 },
    })

    // Save the PDF
    doc.save(`${fileName}.pdf`)
  } catch (error) {
    console.error("Error exporting data to PDF:", error)
    alert("Failed to export data. Please try again.")
  }
}

