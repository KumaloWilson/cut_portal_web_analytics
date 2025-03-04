import { Router } from "express"
import { QuizController } from "../controllers/quizController"

const router = Router()
const quizController = new QuizController()

// Route to get all quizzes
router.get("/", quizController.getQuizzes)

// Route to get a quiz by ID
router.get("/:quizId", quizController.getQuizById)

// Route to create a quiz
router.post("/", quizController.createQuiz)

// Route to update a quiz
router.put("/:quizId", quizController.updateQuiz)

// Route to delete a quiz
router.delete("/:quizId", quizController.deleteQuiz)

// Route to get quiz attempts
router.get("/:quizId/attempts", quizController.getQuizAttempts)

// Route to create a quiz attempt
router.post("/:quizId/attempts", quizController.createQuizAttempt)

export const quizRoutes = router

