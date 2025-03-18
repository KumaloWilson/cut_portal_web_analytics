import type { Request, Response } from "express"
import { ModuleService } from "../services/moduleService"

export class ModuleController {
  private moduleService: ModuleService

  constructor() {
    this.moduleService = new ModuleService()
  }

  // Get all modules with pagination and filtering
  getModules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = "1", limit = "50", search, facultyCode, programCode } = req.query

      const pageNum = Number.parseInt(page as string, 10)
      const limitNum = Number.parseInt(limit as string, 10)

      const filters: any = {}

      if (search) {
        filters.search = search
      }

      if (facultyCode) {
        filters.facultyCode = facultyCode
      }

      if (programCode) {
        filters.programCode = programCode
      }

      const { modules, total } = await this.moduleService.getModules(pageNum, limitNum, filters)

      res.status(200).json({
        modules,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      })
    } catch (error) {
      console.error("Error getting modules:", error)
      res.status(500).json({ error: "Failed to get modules" })
    }
  }

  // Get a module by ID
  getModuleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params
      const module = await this.moduleService.getModuleById(moduleId)

      if (!module) {
        res.status(404).json({ error: "Module not found" })
        return
      }

      res.status(200).json(module)
    } catch (error) {
      console.error("Error getting module:", error)
      res.status(500).json({ error: "Failed to get module" })
    }
  }

  // Create a module
  createModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const module = req.body
      const result = await this.moduleService.createModule(module)

      res.status(201).json(result)
    } catch (error) {
      console.error("Error creating module:", error)
      res.status(500).json({ error: "Failed to create module" })
    }
  }

  // Update a module
  updateModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params
      const moduleData = req.body
      const result = await this.moduleService.updateModule(moduleId, moduleData)

      if (!result) {
        res.status(404).json({ error: "Module not found" })
        return
      }

      res.status(200).json(result)
    } catch (error) {
      console.error("Error updating module:", error)
      res.status(500).json({ error: "Failed to update module" })
    }
  }

  // Delete a module
  deleteModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params
      const result = await this.moduleService.deleteModule(moduleId)

      if (!result) {
        res.status(404).json({ error: "Module not found" })
        return
      }

      res.status(204).end()
    } catch (error) {
      console.error("Error deleting module:", error)
      res.status(500).json({ error: "Failed to delete module" })
    }
  }

  // Get module activity
  getModuleActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params
      const { days = "30" } = req.query

      const daysNum = Number.parseInt(days as string, 10)
      const activity = await this.moduleService.getModuleActivity(moduleId, daysNum)

      res.status(200).json(activity)
    } catch (error) {
      console.error("Error getting module activity:", error)
      res.status(500).json({ error: "Failed to get module activity" })
    }
  }

  // Get module users
  getModuleUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params
      const { page = "1", limit = "50", role } = req.query

      const pageNum = Number.parseInt(page as string, 10)
      const limitNum = Number.parseInt(limit as string, 10)

      const filters: any = {}

      if (role) {
        filters.role = role
      }

      const { users, total } = await this.moduleService.getModuleUsers(moduleId, pageNum, limitNum, filters)

      res.status(200).json({
        users,
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      })
    } catch (error) {
      console.error("Error getting module users:", error)
      res.status(500).json({ error: "Failed to get module users" })
    }
  }

  // Get module resources
  getModuleResources = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params
      const resources = await this.moduleService.getModuleResources(moduleId)

      res.status(200).json(resources)
    } catch (error) {
      console.error("Error getting module resources:", error)
      res.status(500).json({ error: "Failed to get module resources" })
    }
  }

  // Get module quizzes
  getModuleQuizzes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params
      const quizzes = await this.moduleService.getModuleQuizzes(moduleId)

      res.status(200).json(quizzes)
    } catch (error) {
      console.error("Error getting module quizzes:", error)
      res.status(500).json({ error: "Failed to get module quizzes" })
    }
  }

  // Get module past exam papers
  getModulePastExamPapers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params
      const pastExamPapers = await this.moduleService.getModulePastExamPapers(moduleId)

      res.status(200).json(pastExamPapers)
    } catch (error) {
      console.error("Error getting module past exam papers:", error)
      res.status(500).json({ error: "Failed to get module past exam papers" })
    }
  }
}

