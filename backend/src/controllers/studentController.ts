import type { Request, Response } from "express"
import { StudentService } from "../services/studentService"

export class StudentController {
  private studentService: StudentService

  constructor() {
    this.studentService = new StudentService()
  }

  // Get all students with pagination and filtering
  getStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = "1", limit = "50", search, facultyCode, programCode, level } = req.query

      const pageNum = Number.parseInt(page as string, 10)
      const limitNum = Number.parseInt(limit as string, 10)

      const filters: any = {}

      if (search) {
        filters.search = search
      }

      if (facultyCode) {
        filters.facultyCode = facultyCode
      }

      if (programCode) {
        filters.programCode = programCode
      }

      if (level) {
        filters.level = level
      }

      const { students, total } = await this.studentService.getStudents(pageNum, limitNum, filters)

      res.status(200).json({
        students,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      })
    } catch (error) {
      console.error("Error getting students:", error)
      res.status(500).json({ error: "Failed to get students" })
    }
  }

  // Get a student by ID
  getStudentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const student = await this.studentService.getStudentById(studentId)

      if (!student) {
        res.status(404).json({ error: "Student not found" })
        return
      }

      res.status(200).json(student)
    } catch (error) {
      console.error("Error getting student:", error)
      res.status(500).json({ error: "Failed to get student" })
    }
  }

  // Create a student
  createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const student = req.body
      const result = await this.studentService.createStudent(student)

      res.status(201).json(result)
    } catch (error) {
      console.error("Error creating student:", error)
      res.status(500).json({ error: "Failed to create student" })
    }
  }

  // Update a student
  updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const studentData = req.body
      const result = await this.studentService.updateStudent(studentId, studentData)

      if (!result) {
        res.status(404).json({ error: "Student not found" })
        return
      }

      res.status(200).json(result)
    } catch (error) {
      console.error("Error updating student:", error)
      res.status(500).json({ error: "Failed to update student" })
    }
  }

  // Delete a student
  deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const result = await this.studentService.deleteStudent(studentId)

      if (!result) {
        res.status(404).json({ error: "Student not found" })
        return
      }

      res.status(204).end()
    } catch (error) {
      console.error("Error deleting student:", error)
      res.status(500).json({ error: "Failed to delete student" })
    }
  }

  // Get student activity
  getStudentActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const { days = "30" } = req.query

      const daysNum = Number.parseInt(days as string, 10)
      const activity = await this.studentService.getStudentActivity(studentId, daysNum)

      res.status(200).json(activity)
    } catch (error) {
      console.error("Error getting student activity:", error)
      res.status(500).json({ error: "Failed to get student activity" })
    }
  }

  // Get student modules
  getStudentModules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const modules = await this.studentService.getStudentModules(studentId)

      res.status(200).json(modules)
    } catch (error) {
      console.error("Error getting student modules:", error)
      res.status(500).json({ error: "Failed to get student modules" })
    }
  }

  // Update student modules
  updateStudentModules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const { modules } = req.body

      if (!modules || !Array.isArray(modules)) {
        res.status(400).json({ error: "Modules must be provided as an array" })
        return
      }

      const result = await this.studentService.updateStudentModules(studentId, modules)

      res.status(200).json(result)
    } catch (error) {
      console.error("Error updating student modules:", error)
      res.status(500).json({ error: "Failed to update student modules" })
    }
  }

  // Get student past exam paper accesses
  getStudentPastExamPapers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const pastExamPapers = await this.studentService.getStudentPastExamPapers(studentId)

      res.status(200).json(pastExamPapers)
    } catch (error) {
      console.error("Error getting student past exam papers:", error)
      res.status(500).json({ error: "Failed to get student past exam papers" })
    }
  }

  // Get student faculty statistics
  getStudentFacultyStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const stats = await this.studentService.getStudentFacultyStats(studentId)

      res.status(200).json(stats)
    } catch (error) {
      console.error("Error getting student faculty statistics:", error)
      res.status(500).json({ error: "Failed to get student faculty statistics" })
    }
  }

  // Get student program statistics
  getStudentProgramStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params
      const stats = await this.studentService.getStudentProgramStats(studentId)

      res.status(200).json(stats)
    } catch (error) {
      console.error("Error getting student program statistics:", error)
      res.status(500).json({ error: "Failed to get student program statistics" })
    }
  }
}

