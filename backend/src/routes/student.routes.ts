import { Router } from "express"
import { StudentController } from "../controller/student.controller"

const router = Router()

// Get all students
router.get("/", StudentController.getAllStudents)

// Get a student by ID
router.get("/:studentId", StudentController.getStudentById)

// Create or update a student
router.post("/", StudentController.createOrUpdateStudent)

// Add modules for a student
router.post("/:studentId/modules", StudentController.addModulesToStudent)

// Get modules for a student
router.get("/:studentId/modules", StudentController.getStudentModules)

export default router
