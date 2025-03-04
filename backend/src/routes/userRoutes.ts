import { Router } from "express"
import { UserController } from "../controllers/userController"

const router = Router()
const userController = new UserController()

// Route to get all users
router.get("/", userController.getUsers)

// Route to get a user by ID
router.get("/:userId", userController.getUserById)

// Route to create a user
router.post("/", userController.createUser)

// Route to update a user
router.put("/:userId", userController.updateUser)

// Route to delete a user
router.delete("/:userId", userController.deleteUser)

// Route to get user activity
router.get("/:userId/activity", userController.getUserActivity)

// Route to get user courses
router.get("/:userId/courses", userController.getUserCourses)

export const userRoutes = router

