import type { Request, Response } from "express"
import { StudentModel } from "../models/student.model"
import { EventModel } from "../models/event.model"
import { SessionModel } from "../models/session.model"
import { ExportService } from "../services/export.service"

export class ExportController {
  static async exportStudents(req: Request, res: Response) {
    try {
      const students = await StudentModel.findAll()

      // Get export format from query parameter
      const format = (req.query.format as string) || "excel"

      if (format === "excel") {
        const buffer = await ExportService.exportToExcel(students, "students", true)

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=students_${new Date().toISOString().split("T")[0]}.xlsx`,
        )
        return res.send(buffer)
      } else {
        // Default to JSON
        return res.json({ students })
      }
    } catch (error) {
      console.error("Export students error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  static async exportEvents(req: Request, res: Response) {
    try {
      const limit = Number.parseInt(req.query.limit as string) || 1000
      const offset = Number.parseInt(req.query.offset as string) || 0
      const studentId = req.query.studentId as string

      let events
      if (studentId) {
        events = await EventModel.findByStudentId(studentId, limit, offset)
      } else {
        // We need to implement a method to get all events with pagination
        events = await EventModel.getEvents(limit, offset)
      }

      // Get export format from query parameter
      const format = (req.query.format as string) || "excel"

      if (format === "excel") {
        const buffer = await ExportService.exportToExcel(events, "events", true)

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=events_${new Date().toISOString().split("T")[0]}.xlsx`,
        )
        return res.send(buffer)
      } else {
        // Default to JSON
        return res.json({ events })
      }
    } catch (error) {
      console.error("Export events error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  static async exportSessions(req: Request, res: Response) {
    try {
      const studentId = req.query.studentId as string

      let sessions
      if (studentId) {
        sessions = await SessionModel.findByStudentId(studentId)
      } else {
        // We need to implement a method to get all sessions
        sessions = await SessionModel.getAllSessions()
      }

      // Get export format from query parameter
      const format = (req.query.format as string) || "excel"

      if (format === "excel") {
        const buffer = await ExportService.exportToExcel(sessions, "sessions", true)

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=sessions_${new Date().toISOString().split("T")[0]}.xlsx`,
        )
        return res.send(buffer)
      } else {
        // Default to JSON
        return res.json({ sessions })
      }
    } catch (error) {
      console.error("Export sessions error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
}
