import type { Request, Response } from "express"
import { AnalyticsService } from "../services/analytics.service"

export class AnalyticsController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const overview = await AnalyticsService.getOverview()
      res.status(200).json(overview)
    } catch (error) {
      console.error("Error fetching analytics overview:", error)
      res.status(500).json({ error: "Failed to fetch analytics overview" })
    }
  }

  static async getActivityOverTime(req: Request, res: Response): Promise<void> {
    try {
      const days = req.query.days ? Number.parseInt(req.query.days as string) : 30
      const activity = await AnalyticsService.getActivityOverTime(days)
      res.status(200).json(activity)
    } catch (error) {
      console.error("Error fetching activity data:", error)
      res.status(500).json({ error: "Failed to fetch activity data" })
    }
  }

  static async getTopPages(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 10
      const pages = await AnalyticsService.getTopPages(limit)
      res.status(200).json(pages)
    } catch (error) {
      console.error("Error fetching page analytics:", error)
      res.status(500).json({ error: "Failed to fetch page analytics" })
    }
  }

  static async getStudentEngagement(req: Request, res: Response): Promise<void> {
    try {
      const engagement = await AnalyticsService.getStudentEngagement()
      res.status(200).json(engagement)
    } catch (error) {
      console.error("Error fetching engagement metrics:", error)
      res.status(500).json({ error: "Failed to fetch engagement metrics" })
    }
  }

  static async getModuleEngagement(req: Request, res: Response): Promise<void> {
    try {
      const engagement = await AnalyticsService.getModuleEngagement()
      res.status(200).json(engagement)
    } catch (error) {
      console.error("Error fetching module metrics:", error)
      res.status(500).json({ error: "Failed to fetch module metrics" })
    }
  }

  static async getTimeOfDayActivity(req: Request, res: Response): Promise<void> {
    try {
      const activity = await AnalyticsService.getTimeOfDayActivity()
      res.status(200).json(activity)
    } catch (error) {
      console.error("Error fetching time of day metrics:", error)
      res.status(500).json({ error: "Failed to fetch time of day metrics" })
    }
  }

  static async getDailyVisitors(req: Request, res: Response): Promise<void> {
    try {
      const visitors = await AnalyticsService.getDailyVisitors()
      res.status(200).json(visitors)
    } catch (error) {
      console.error("Error fetching daily visitors:", error)
      res.status(500).json({ error: "Failed to fetch daily visitors" })
    }
  }
}
