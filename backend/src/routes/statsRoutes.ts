import { Router } from "express"
import { StatsController } from "../controllers/statsController"

const router = Router()
const statsController = new StatsController()

// Route to get overall stats
router.get("/", statsController.getOverallStats)

// Route to get user stats
router.get("/user/:userId?", statsController.getUserStats)

// Route to get daily stats
router.get("/daily", statsController.getDailyStats)

// Route to get weekly stats
router.get("/weekly", statsController.getWeeklyStats)

// Route to get monthly stats
router.get("/monthly", statsController.getMonthlyStats)

export const statsRoutes = router

