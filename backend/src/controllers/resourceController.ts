import type { Request, Response } from "express"
import { ResourceService } from "../services/resourceService"

export class ResourceController {
    private resourceService: ResourceService

    constructor() {
        this.resourceService = new ResourceService()
    }

    // Get all resources with pagination and filtering
    getResources = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page = "1", limit = "50", courseId, type } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const filters: any = {}

            if (courseId) {
                filters.courseId = courseId
            }

            if (type) {
                filters.type = type
            }

            const { resources, total } = await this.resourceService.getResources(pageNum, limitNum, filters)

            res.status(200).json({
                resources,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting resources:", error)
            res.status(500).json({ error: "Failed to get resources" })
        }
    }

    // Get a resource by ID
    getResourceById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { resourceId } = req.params
            const resource = await this.resourceService.getResourceById(resourceId)

            if (!resource) {
                res.status(404).json({ error: "Resource not found" })
                return
            }

            res.status(200).json(resource)
        } catch (error) {
            console.error("Error getting resource:", error)
            res.status(500).json({ error: "Failed to get resource" })
        }
    }

    // Create a resource
    createResource = async (req: Request, res: Response): Promise<void> => {
        try {
            const resource = req.body
            const result = await this.resourceService.createResource(resource)

            res.status(201).json(result)
        } catch (error) {
            console.error("Error creating resource:", error)
            res.status(500).json({ error: "Failed to create resource" })
        }
    }

    // Update a resource
    updateResource = async (req: Request, res: Response): Promise<void> => {
        try {
            const { resourceId } = req.params
            const resourceData = req.body
            const result = await this.resourceService.updateResource(resourceId, resourceData)

            if (!result) {
                res.status(404).json({ error: "Resource not found" })
                return
            }

            res.status(200).json(result)
        } catch (error) {
            console.error("Error updating resource:", error)
            res.status(500).json({ error: "Failed to update resource" })
        }
    }

    // Delete a resource
    deleteResource = async (req: Request, res: Response): Promise<void> => {
        try {
            const { resourceId } = req.params
            const result = await this.resourceService.deleteResource(resourceId)

            if (!result) {
                res.status(404).json({ error: "Resource not found" })
                return
            }

            res.status(204).end()
        } catch (error) {
            console.error("Error deleting resource:", error)
            res.status(500).json({ error: "Failed to delete resource" })
        }
    }

    // Get resource interactions
    getResourceInteractions = async (req: Request, res: Response): Promise<void> => {
        try {
            const { resourceId } = req.params
            const { page = "1", limit = "50" } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const { interactions, total } = await this.resourceService.getResourceInteractions(resourceId, pageNum, limitNum)

            res.status(200).json({
                interactions,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting resource interactions:", error)
            res.status(500).json({ error: "Failed to get resource interactions" })
        }
    }
}

