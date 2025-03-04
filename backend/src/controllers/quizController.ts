import type { Request, Response } from "express"
import { QuizService } from "../services/quizService"


export class QuizController {
    private readonly quizService: QuizService

    constructor() {
        this.quizService = new QuizService()
    }

    // Get all quizzes with pagination and filtering
    getQuizzes = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page = "1", limit = "50", courseId } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const filters: any = {}

            if (courseId) {
                filters.courseId = courseId
            }

            const { quizzes, total } = await this.quizService.getQuizzes(pageNum, limitNum, filters)

            res.status(200).json({
                quizzes,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting quizzes:", error)
            res.status(500).json({ error: "Failed to get quizzes" })
        }
    }

    // Get a quiz by ID
    getQuizById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { quizId } = req.params
            const quiz = await this.quizService.getQuizById(quizId)

            if (!quiz) {
                res.status(404).json({ error: "Quiz not found" })
                return
            }

            res.status(200).json(quiz)
        } catch (error) {
            console.error("Error getting quiz:", error)
            res.status(500).json({ error: "Failed to get quiz" })
        }
    }

    // Create a quiz
    createQuiz = async (req: Request, res: Response): Promise<void> => {
        try {
            const quiz = req.body
            const result = await this.quizService.createQuiz(quiz)

            res.status(201).json(result)
        } catch (error) {
            console.error("Error creating quiz:", error)
            res.status(500).json({ error: "Failed to create quiz" })
        }
    }

    // Update a quiz
    updateQuiz = async (req: Request, res: Response): Promise<void> => {
        try {
            const { quizId } = req.params
            const quizData = req.body
            const result = await this.quizService.updateQuiz(quizId, quizData)

            if (!result) {
                res.status(404).json({ error: "Quiz not found" })
                return
            }

            res.status(200).json(result)
        } catch (error) {
            console.error("Error updating quiz:", error)
            res.status(500).json({ error: "Failed to update quiz" })
        }
    }

    // Delete a quiz
    deleteQuiz = async (req: Request, res: Response): Promise<void> => {
        try {
            const { quizId } = req.params
            const result = await this.quizService.deleteQuiz(quizId)

            if (!result) {
                res.status(404).json({ error: "Quiz not found" })
                return
            }

            res.status(204).end()
        } catch (error) {
            console.error("Error deleting quiz:", error)
            res.status(500).json({ error: "Failed to delete quiz" })
        }
    }

    // Get quiz attempts
    getQuizAttempts = async (req: Request, res: Response): Promise<void> => {
        try {
            const { quizId } = req.params
            const { page = "1", limit = "50", userId } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const filters: any = {}

            if (userId) {
                filters.userId = userId
            }

            const { attempts, total } = await this.quizService.getQuizAttempts(quizId, pageNum, limitNum, filters)

            res.status(200).json({
                attempts,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting quiz attempts:", error)
            res.status(500).json({ error: "Failed to get quiz attempts" })
        }
    }

    // Create a quiz attempt
    createQuizAttempt = async (req: Request, res: Response): Promise<void> => {
        try {
            const { quizId } = req.params
            const attemptData = req.body

            // Ensure quizId is set in the attempt data
            attemptData.quizId = quizId

            const result = await this.quizService.createQuizAttempt(attemptData)

            res.status(201).json(result)
        } catch (error) {
            console.error("Error creating quiz attempt:", error)
            res.status(500).json({ error: "Failed to create quiz attempt" })
        }
    }
}

