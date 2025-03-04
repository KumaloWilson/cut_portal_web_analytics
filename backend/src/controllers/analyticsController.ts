import type { Request, Response } from "express"
import { AnalyticsService } from "../services/analyticsService"

export class AnalyticsController {
    private readonly analyticsService: AnalyticsService

    constructor() {
        this.analyticsService = new AnalyticsService()
    }

    // Get page view analytics
    getPageViewAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate } = req.query

            const filters: any = {}

            if (startDate) {
                filters.startDate = new Date(startDate as string)
            }

            if (endDate) {
                filters.endDate = new Date(endDate as string)
            }

            const analytics = await this.analyticsService.getPageViewAnalytics(filters)

            res.status(200).json(analytics)
        } catch (error) {
            console.error("Error getting page view analytics:", error)
            res.status(500).json({ error: "Failed to get page view analytics" })
        }
    }

    // Get user engagement analytics
    getUserEngagementAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate, userId } = req.query

            const filters: any = {}

            if (startDate) {
                filters.startDate = new Date(startDate as string)
            }

            if (endDate) {
                filters.endDate = new Date(endDate as string)
            }

            if (userId) {
                filters.userId = userId
            }

            const analytics = await this.analyticsService.getUserEngagementAnalytics(filters)

            res.status(200).json(analytics)
        } catch (error) {
            console.error("Error getting user engagement analytics:", error)
            res.status(500).json({ error: "Failed to get user engagement analytics" })
        }
    }

    // Get resource access analytics
    getResourceAccessAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate } = req.query

            const filters: any = {}

            if (startDate) {
                filters.startDate = new Date(startDate as string)
            }

            if (endDate) {
                filters.endDate = new Date(endDate as string)
            }

            const analytics = await this.analyticsService.getResourceAccessAnalytics(filters)

            res.status(200).json(analytics)
        } catch (error) {
            console.error("Error getting resource access analytics:", error)
            res.status(500).json({ error: "Failed to get resource access analytics" })
        }
    }

    // Get time spent analytics
    getTimeSpentAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate, userId } = req.query

            const filters: any = {}

            if (startDate) {
                filters.startDate = new Date(startDate as string)
            }

            if (endDate) {
                filters.endDate = new Date(endDate as string)
            }

            if (userId) {
                filters.userId = userId
            }

            const analytics = await this.analyticsService.getTimeSpentAnalytics(filters)

            res.status(200).json(analytics)
        } catch (error) {
            console.error("Error getting time spent analytics:", error)
            res.status(500).json({ error: "Failed to get time spent analytics" })
        }
    }

    // Get event frequency analytics
    getEventFrequencyAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate, interval = "day" } = req.query

            const filters: any = {
                interval: interval as string,
            }

            if (startDate) {
                filters.startDate = new Date(startDate as string)
            }

            if (endDate) {
                filters.endDate = new Date(endDate as string)
            }

            const analytics = await this.analyticsService.getEventFrequencyAnalytics(filters)

            res.status(200).json(analytics)
        } catch (error) {
            console.error("Error getting event frequency analytics:", error)
            res.status(500).json({ error: "Failed to get event frequency analytics" })
        }
    }

    // Get dashboard data (combined analytics)
    getDashboardData = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate } = req.query

            const filters: any = {}

            if (startDate) {
                filters.startDate = new Date(startDate as string)
            }

            if (endDate) {
                filters.endDate = new Date(endDate as string)
            }

            const dashboardData = await this.analyticsService.getDashboardData(filters)

            res.status(200).json(dashboardData)
        } catch (error) {
            console.error("Error getting dashboard data:", error)
            res.status(500).json({ error: "Failed to get dashboard data" })
        }
    }
}

