import { Router } from "express"
import { CourseController } from "../controllers/courseController"

const router = Router()
const courseController = new CourseController()

// Route to get all courses
router.get("/", courseController.getCourses)

// Route to get a course by ID
router.get("/:courseId", courseController.getCourseById)

// Route to create a course
router.post("/", courseController.createCourse)

// Route to update a course
router.put("/:courseId", courseController.updateCourse)

// Route to delete a course
router.delete("/:courseId", courseController.deleteCourse)

// Route to get course activity
router.get("/:courseId/activity", courseController.getCourseActivity)

// Route to get course users
router.get("/:courseId/users", courseController.getCourseUsers)

// Route to get course resources
router.get("/:courseId/resources", courseController.getCourseResources)

// Route to get course quizzes
router.get("/:courseId/quizzes", courseController.getCourseQuizzes)

export const courseRoutes = router

