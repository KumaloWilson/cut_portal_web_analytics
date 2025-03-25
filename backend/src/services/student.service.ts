import { type Student, StudentModel } from "../models/student.model"
import { ModuleModel } from "../models/module.model"

export class StudentService {
  static async getStudentById(studentId: string): Promise<Student | null> {
    return StudentModel.findById(studentId)
  }

  static async getAllStudents(): Promise<Student[]> {
    return StudentModel.findAll()
  }

  static async createOrUpdateStudent(student: Student): Promise<Student> {
    const exists = await StudentModel.exists(student.student_id)

    if (exists) {
      const updatedStudent = await StudentModel.update(student)
      if (!updatedStudent) {
        throw new Error(`Failed to update student with ID ${student.student_id}`)
      }
      return updatedStudent
    } else {
      return StudentModel.create(student)
    }
  }

  static async addModulesToStudent(
    studentId: string,
    modules: Array<{ module_id: string; module_name: string; module_code: string }>,
    periodId: string,
  ): Promise<void> {
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
  }

  static async getStudentModules(studentId: string): Promise<any[]> {
    // Check if student exists
    const studentExists = await StudentModel.exists(studentId)
    if (!studentExists) {
      throw new Error(`Student with ID ${studentId} not found`)
    }

    return ModuleModel.getStudentModules(studentId)
  }
}

