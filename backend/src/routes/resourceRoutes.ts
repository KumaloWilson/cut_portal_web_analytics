import { Router } from "express"
import { ResourceController } from "../controllers/resourceController"

const router = Router()
const resourceController = new ResourceController()

// Route to get all resources
router.get("/", resourceController.getResources)

// Route to get a resource by ID
router.get("/:resourceId", resourceController.getResourceById)

// Route to create a resource
router.post("/", resourceController.createResource)

// Route to update a resource
router.put("/:resourceId", resourceController.updateResource)

// Route to delete a resource
router.delete("/:resourceId", resourceController.deleteResource)

// Route to get resource interactions
router.get("/:resourceId/interactions", resourceController.getResourceInteractions)

export const resourceRoutes = router

