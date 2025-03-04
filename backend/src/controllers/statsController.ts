import type { Request, Response } from "express"
import { StatsService } from "../services/statsService"

export class StatsController {
    private statsService: StatsService

    constructor() {
        this.statsService = new StatsService()
    }

    // Get overall stats
    getOverallStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.statsService.getOverallStats()
            res.status(200).json(stats)
        } catch (error) {
            console.error("Error getting overall stats:", error)
            res.status(500).json({ error: "Failed to get overall stats" })
        }
    }

    // Get user stats
    getUserStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params
            const stats = await this.statsService.getUserStats(userId)
            res.status(200).json(stats)
        } catch (error) {
            console.error("Error getting user stats:", error)
            res.status(500).json({ error: "Failed to get user stats" })
        }
    }

    // Get daily stats
    getDailyStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const { date } = req.query
            const targetDate = date ? new Date(date as string) : new Date()
            const stats = await this.statsService.getDailyStats(targetDate)
            res.status(200).json(stats)
        } catch (error) {
            console.error("Error getting daily stats:", error)
            res.status(500).json({ error: "Failed to get daily stats" })
        }
    }

    // Get weekly stats
    getWeeklyStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate } = req.query
            const weekStart = startDate ? new Date(startDate as string) : new Date()
            const stats = await this.statsService.getWeeklyStats(weekStart)
            res.status(200).json(stats)
        } catch (error) {
            console.error("Error getting weekly stats:", error)
            res.status(500).json({ error: "Failed to get weekly stats" })
        }
    }

    // Get monthly stats
    getMonthlyStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const { year, month } = req.query

            const yearNum = year ? Number.parseInt(year as string, 10) : new Date().getFullYear()
            const monthNum = month ? Number.parseInt(month as string, 10) - 1 : new Date().getMonth()

            const stats = await this.statsService.getMonthlyStats(yearNum, monthNum)
            res.status(200).json(stats)
        } catch (error) {
            console.error("Error getting monthly stats:", error)
            res.status(500).json({ error: "Failed to get monthly stats" })
        }
    }
}

