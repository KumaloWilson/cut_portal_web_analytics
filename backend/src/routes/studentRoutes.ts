import { Router } from "express"
import { StudentController } from "../controllers/studentController"

const router = Router()
const studentController = new StudentController()

// Route to get all students
router.get("/", studentController.getStudents)

// Route to get a student by ID
router.get("/:studentId", studentController.getStudentById)

// Route to create a student
router.post("/", studentController.createStudent)

// Route to update a student
router.put("/:studentId", studentController.updateStudent)

// Route to delete a student
router.delete("/:studentId", studentController.deleteStudent)

// Route to get student activity
router.get("/:studentId/activity", studentController.getStudentActivity)

// Route to get student modules
router.get("/:studentId/modules", studentController.getStudentModules)

// Route to update student modules
router.put("/:studentId/modules", studentController.updateStudentModules)

// Route to get student past exam paper accesses
router.get("/:studentId/past-exam-papers", studentController.getStudentPastExamPapers)

// Route to get student faculty statistics
router.get("/:studentId/faculty-stats", studentController.getStudentFacultyStats)

// Route to get student program statistics
router.get("/:studentId/program-stats", studentController.getStudentProgramStats)

export const studentRoutes = router

