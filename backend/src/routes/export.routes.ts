import { Router } from "express"
import { ExportController } from "../controllers/export.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

// All export routes are protected
router.get("/students", authMiddleware, ExportController.exportStudents)
router.get("/events", authMiddleware, ExportController.exportEvents)
router.get("/sessions", authMiddleware, ExportController.exportSessions)

export default router
