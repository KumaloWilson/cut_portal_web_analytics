import ExcelJS from "exceljs"
import { anonymizeData } from "./anonymize.service"

export class ExportService {
  static async exportToExcel(data: any[], type: "students" | "events" | "sessions", anonymize = true): Promise<Buffer> {
    // Anonymize data if requested
    const processedData = anonymize ? anonymizeData(data, type) : data

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1))

    // Add headers
    if (processedData.length > 0) {
      const headers = Object.keys(processedData[0])
      worksheet.addRow(headers)

      // Add data rows
      processedData.forEach((item) => {
        const row = headers.map((header) => {
          const value = item[header]
          if (value === null || value === undefined) return ""
          if (typeof value === "object") return JSON.stringify(value)
          return value
        })
        worksheet.addRow(row)
      })

      // Format headers
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true }
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        }
      })

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = maxLength < 10 ? 10 : maxLength + 2
      })
    }

    // Generate buffer
    return await workbook.xlsx.writeBuffer()
  }
}
