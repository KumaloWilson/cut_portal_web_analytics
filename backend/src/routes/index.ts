import { Router } from "express"
import studentRoutes from "./student.routes"
import sessionRoutes from "./session.routes"
import eventRoutes from "./event.routes"
import syncRoutes from "./sync.routes"
import analyticsRoutes from "./analytics.routes"
import authRoutes from "./auth.routes"
import exportRoutes from "./export.routes"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

// Public routes
router.use("/auth", authRoutes)

// Protected routes
router.use("/students", authMiddleware, studentRoutes)
router.use("/sessions", authMiddleware, sessionRoutes)
router.use("/events", authMiddleware, eventRoutes)
router.use("/sync", authMiddleware, syncRoutes)
router.use("/analytics", authMiddleware, analyticsRoutes)
router.use("/export", authMiddleware, exportRoutes)

export default router
