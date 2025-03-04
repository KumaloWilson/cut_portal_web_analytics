import { Router } from "express"
import { AnalyticsController } from "../controllers/analyticsController"

const router = Router()
const analyticsController = new AnalyticsController()

// Route to get page view analytics
router.get("/page-views", analyticsController.getPageViewAnalytics)

// Route to get user engagement analytics
router.get("/engagement", analyticsController.getUserEngagementAnalytics)

// Route to get resource access analytics
router.get("/resources", analyticsController.getResourceAccessAnalytics)

// Route to get time spent analytics
router.get("/time-spent", analyticsController.getTimeSpentAnalytics)

// Route to get event frequency analytics
router.get("/event-frequency", analyticsController.getEventFrequencyAnalytics)

// Route to get analytics dashboard data (combined data)
router.get("/dashboard", analyticsController.getDashboardData)

export const analyticsRoutes = router

