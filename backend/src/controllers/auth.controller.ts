import type { Request, Response } from "express"
import { AuthService } from "../services/auth.service"
import { AdminModel } from "../models/admin.model"

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" })
        return 
      }

      const result = await AuthService.login(email, password)
      if (!result) {
        res.status(401).json({ message: "Invalid email or password" })
        return 
      }

      res.status(200).json({
        message: "Login successful",
        admin: result.admin,
        token: result.token,
      })
    } catch (error) {
      console.error("Login controller error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }

  static async register(req: Request, res: Response) {
    try {
      // Only authenticated admins can register new admins
      const currentAdminId = req.user?.id
      if (!currentAdminId) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const { username, email, password } = req.body

      if (!username || !email || !password) {
       res.status(400).json({ message: "Username, email, and password are required" })
       return 
      }

      // Validate password strength
      if (password.length < 8) {
        res.status(400).json({ message: "Password must be at least 8 characters long" })
        return 
      }

      const newAdmin = await AuthService.registerAdmin({ username, email, password }, currentAdminId)

      res.status(201).json({
        message: "Admin registered successfully",
        admin: newAdmin,
      })
    } catch (error: any) {
      console.error("Register controller error:", error)

      if (error.message.includes("already exists")) {
        res.status(409).json({ message: error.message })
        return 
      }

      res.status(500).json({ message: "Internal server error" })
    }
  }

  static async getCurrentAdmin(req: Request, res: Response) {
    try {
      const adminId = req.user?.id
      if (!adminId) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const admin = await AdminModel.findById(adminId)
      if (!admin) {
         res.status(404).json({ message: "Admin not found" })
         return
      }

      // Remove password from admin object
      const { password: _, ...adminWithoutPassword } = admin

      res.status(200).json({
        admin: adminWithoutPassword,
      })
    } catch (error) {
      console.error("Get current admin error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
}
