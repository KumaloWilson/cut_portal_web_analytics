import { type Student, StudentModel } from "../models/student.model"
import { ModuleModel } from "../models/module.model"
import { WebSocketService } from "./socket.service"

export class StudentService {
  static async getStudentById(studentId: string): Promise<Student | null> {
    return StudentModel.findById(studentId)
  }

  static async getAllStudents(): Promise<Student[]> {
    return StudentModel.findAll()
  }

  static async createOrUpdateStudent(student: Student): Promise<Student> {
    try {
      const exists = await StudentModel.exists(student.student_id)
      let result: Student

      if (exists) {
        console.log(`Updating existing student: ${student.student_id}`)
        const updatedStudent = await StudentModel.update(student)
        if (!updatedStudent) {
          throw new Error(`Failed to update student with ID ${student.student_id}`)
        }
        result = updatedStudent
      } else {
        console.log(`Creating new student: ${student.student_id}`)
        result = await StudentModel.create(student)
      }

      // Broadcast student update via WebSocket
      WebSocketService.broadcastStudentUpdate(result)

      return result
    } catch (error) {
      console.error("Error in createOrUpdateStudent:", error)
      throw error
    }
  }

  static async addModulesToStudent(
    studentId: string,
    modules: Array<{ module_id: string; module_name: string; module_code: string }>,
    periodId: string,
  ): Promise<void> {
    try {
      // Check if student exists
      const studentExists = await StudentModel.exists(studentId)
      if (!studentExists) {
        throw new Error(`Student with ID ${studentId} not found`)
      }

      // Process each module
      for (const module of modules) {
        // Check if module exists, create if not
        const moduleExists = await ModuleModel.exists(module.module_id)
        if (!moduleExists) {
          await ModuleModel.create(module)
        }

        // Add student-module relationship
        await ModuleModel.addStudentModule(studentId, module.module_id, periodId)
      }

      // Broadcast modules update via WebSocket
      WebSocketService.broadcastAnalyticsUpdate("student-modules", {
        student_id: studentId,
        modules_count: modules.length,
      })
    } catch (error) {
      console.error("Error in addModulesToStudent:", error)
      throw error
    }
  }

  static async getStudentModules(studentId: string): Promise<any[]> {
    try {
      // Check if student exists
      const studentExists = await StudentModel.exists(studentId)
      if (!studentExists) {
        throw new Error(`Student with ID ${studentId} not found`)
      }

      return ModuleModel.getStudentModules(studentId)
    } catch (error) {
      console.error("Error in getStudentModules:", error)
      throw error
    }
  }
}
