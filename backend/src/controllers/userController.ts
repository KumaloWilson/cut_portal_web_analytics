import type { Request, Response } from "express"
import { UserService } from "../services/userService"

export class UserController {
    private readonly userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    // Get all users with pagination and filtering
    getUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page = "1", limit = "50", search, role } = req.query

            const pageNum = Number.parseInt(page as string, 10)
            const limitNum = Number.parseInt(limit as string, 10)

            const filters: any = {}

            if (search) {
                filters.search = search
            }

            if (role) {
                filters.role = role
            }

            const { users, total } = await this.userService.getUsers(pageNum, limitNum, filters)

            res.status(200).json({
                users,
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            })
        } catch (error) {
            console.error("Error getting users:", error)
            res.status(500).json({ error: "Failed to get users" })
        }
    }

    // Get a user by ID
    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params
            const user = await this.userService.getUserById(userId)

            if (!user) {
                res.status(404).json({ error: "User not found" })
                return
            }

            res.status(200).json(user)
        } catch (error) {
            console.error("Error getting user:", error)
            res.status(500).json({ error: "Failed to get user" })
        }
    }

    // Create a user
    createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = req.body
            const result = await this.userService.createUser(user)

            res.status(201).json(result)
        } catch (error) {
            console.error("Error creating user:", error)
            res.status(500).json({ error: "Failed to create user" })
        }
    }

    // Update a user
    updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params
            const userData = req.body
            const result = await this.userService.updateUser(userId, userData)

            if (!result) {
                res.status(404).json({ error: "User not found" })
                return
            }

            res.status(200).json(result)
        } catch (error) {
            console.error("Error updating user:", error)
            res.status(500).json({ error: "Failed to update user" })
        }
    }

    // Delete a user
    deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params
            const result = await this.userService.deleteUser(userId)

            if (!result) {
                res.status(404).json({ error: "User not found" })
                return
            }

            res.status(204).end()
        } catch (error) {
            console.error("Error deleting user:", error)
            res.status(500).json({ error: "Failed to delete user" })
        }
    }

    // Get user activity
    getUserActivity = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params
            const { days = "30" } = req.query

            const daysNum = Number.parseInt(days as string, 10)
            const activity = await this.userService.getUserActivity(userId, daysNum)

            res.status(200).json(activity)
        } catch (error) {
            console.error("Error getting user activity:", error)
            res.status(500).json({ error: "Failed to get user activity" })
        }
    }

    // Get user courses
    getUserCourses = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params
            const courses = await this.userService.getUserCourses(userId)

            res.status(200).json(courses)
        } catch (error) {
            console.error("Error getting user courses:", error)
            res.status(500).json({ error: "Failed to get user courses" })
        }
    }
}

