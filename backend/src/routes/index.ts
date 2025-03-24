import { Router } from "express"
import studentRoutes from "./students"
import sessionRoutes from "./sessions"
import eventRoutes from "./events"
import analyticsRoutes from "./analytics"
import syncRoutes from "./sync"

const router = Router()


router.use("/students", studentRoutes)
router.use("/sessions", sessionRoutes)
router.use("/events", eventRoutes)
router.use("/analytics", analyticsRoutes)
router.use("/sync", syncRoutes)

export default router