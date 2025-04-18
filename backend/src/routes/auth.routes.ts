import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

// Public routes
router.post("/login", AuthController.login)

// Protected routes
router.post("/register", authMiddleware, AuthController.register)
router.get("/me", authMiddleware, AuthController.getCurrentAdmin)

export default router
