import { Router } from "express"
import { AnalyticsController } from "../controller/analytics.controller"

const router = Router()

// Get overall analytics
router.get("/overview", AnalyticsController.getOverview)

// Get student activity over time
router.get("/activity", AnalyticsController.getActivityOverTime)

// Get page analytics
router.get("/pages", AnalyticsController.getTopPages)

// Get student engagement metrics
router.get("/engagement", AnalyticsController.getStudentEngagement)

// Get module engagement metrics
router.get("/modules", AnalyticsController.getModuleEngagement)

// Get student activity by time of day
router.get("/time-of-day", AnalyticsController.getTimeOfDayActivity)

export default router

