import { Router } from "express"
import { ModuleController } from "../controllers/moduleController"

const router = Router()
const moduleController = new ModuleController()

// Route to get all modules
router.get("/", moduleController.getModules)

// Route to get a module by ID
router.get("/:moduleId", moduleController.getModuleById)

// Route to create a module
router.post("/", moduleController.createModule)

// Route to update a module
router.put("/:moduleId", moduleController.updateModule)

// Route to delete a module
router.delete("/:moduleId", moduleController.deleteModule)

// Route to get module activity
router.get("/:moduleId/activity", moduleController.getModuleActivity)

// Route to get module users
router.get("/:moduleId/users", moduleController.getModuleUsers)

// Route to get module resources
router.get("/:moduleId/resources", moduleController.getModuleResources)

// Route to get module quizzes
router.get("/:moduleId/quizzes", moduleController.getModuleQuizzes)

// Route to get module past exam papers
router.get("/:moduleId/past-exam-papers", moduleController.getModulePastExamPapers)

export const moduleRoutes = router

