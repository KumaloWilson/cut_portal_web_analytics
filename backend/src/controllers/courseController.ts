import type { Request, Response } from "express"
import { CourseService } from "../services/courseService"

export class CourseController {
    private courseService: CourseService

    constructor() {
        this.courseService = new CourseService()
    }

    // Get all courses with pagination and filtering
    getCourses = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page = "1", limit = "50", search, instructorId } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const filters: any = {}

            if (search) {
                filters.search = search
            }

            if (instructorId) {
                filters.instructorId = instructorId
            }

            const { courses, total } = await this.courseService.getCourses(pageNum, limitNum, filters)

            res.status(200).json({
                courses,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting courses:", error)
            res.status(500).json({ error: "Failed to get courses" })
        }
    }

    // Get a course by ID
    getCourseById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params
            const course = await this.courseService.getCourseById(courseId)

            if (!course) {
                res.status(404).json({ error: "Course not found" })
                return
            }

            res.status(200).json(course)
        } catch (error) {
            console.error("Error getting course:", error)
            res.status(500).json({ error: "Failed to get course" })
        }
    }

    // Create a course
    createCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const course = req.body
            const result = await this.courseService.createCourse(course)

            res.status(201).json(result)
        } catch (error) {
            console.error("Error creating course:", error)
            res.status(500).json({ error: "Failed to create course" })
        }
    }

    // Update a course
    updateCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params
            const courseData = req.body
            const result = await this.courseService.updateCourse(courseId, courseData)

            if (!result) {
                res.status(404).json({ error: "Course not found" })
                return
            }

            res.status(200).json(result)
        } catch (error) {
            console.error("Error updating course:", error)
            res.status(500).json({ error: "Failed to update course" })
        }
    }

    // Delete a course
    deleteCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params
            const result = await this.courseService.deleteCourse(courseId)

            if (!result) {
                res.status(404).json({ error: "Course not found" })
                return
            }

            res.status(204).end()
        } catch (error) {
            console.error("Error deleting course:", error)
            res.status(500).json({ error: "Failed to delete course" })
        }
    }

    // Get course activity
    getCourseActivity = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params
            const { days = "30" } = req.query

            const daysNum = Number.parseInt(days as string, 10)
            const activity = await this.courseService.getCourseActivity(courseId, daysNum)

            res.status(200).json(activity)
        } catch (error) {
            console.error("Error getting course activity:", error)
            res.status(500).json({ error: "Failed to get course activity" })
        }
    }

    // Get course users
    getCourseUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params
            const { page = "1", limit = "50", role } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const filters: any = {}

            if (role) {
                filters.role = role
            }

            const { users, total } = await this.courseService.getCourseUsers(courseId, pageNum, limitNum, filters)

            res.status(200).json({
                users,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting course users:", error)
            res.status(500).json({ error: "Failed to get course users" })
        }
    }

    // Get course resources
    getCourseResources = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params
            const resources = await this.courseService.getCourseResources(courseId)

            res.status(200).json(resources)
        } catch (error) {
            console.error("Error getting course resources:", error)
            res.status(500).json({ error: "Failed to get course resources" })
        }
    }

    // Get course quizzes
    getCourseQuizzes = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params
            const quizzes = await this.courseService.getCourseQuizzes(courseId)

            res.status(200).json(quizzes)
        } catch (error) {
            console.error("Error getting course quizzes:", error)
            res.status(500).json({ error: "Failed to get course quizzes" })
        }
    }
}

