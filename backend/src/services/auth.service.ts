import jwt from "jsonwebtoken"
import { AdminModel, type Admin } from "../models/admin.model"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"

export class AuthService {
  static async login(email: string, password: string): Promise<{ admin: Admin; token: string } | null> {
    try {
      // Find admin by email
      const admin = await AdminModel.findByEmail(email)
      if (!admin) {
        return null
      }

      // Validate password
      const isValid = await AdminModel.validatePassword(admin, password)
      if (!isValid) {
        return null
      }

      // Generate JWT token
      const token = this.generateToken(admin);

      // Remove password from admin object
      const { password: _, ...adminWithoutPassword } = admin

      return {
        admin: adminWithoutPassword as Admin,
        token,
      }
    } catch (error) {
      console.error("Login error:", error)
      return null
    }
  }

  static async registerAdmin(admin: Admin, currentAdminId: number): Promise<Admin | null> {
    try {
      // Verify that the current admin exists
      const currentAdmin = await AdminModel.findById(currentAdminId)
      if (!currentAdmin) {
        throw new Error("Unauthorized: Only existing admins can register new admins")
      }

      // Check if username or email already exists
      const existingUsername = await AdminModel.findByUsername(admin.username)
      if (existingUsername) {
        throw new Error("Username already exists")
      }

      const existingEmail = await AdminModel.findByEmail(admin.email)
      if (existingEmail) {
        throw new Error("Email already exists")
      }

      // Create new admin
      const newAdmin = await AdminModel.create(admin)

      // Remove password from admin object
      const { password: _, ...adminWithoutPassword } = newAdmin

      return adminWithoutPassword as Admin
    } catch (error) {
      console.error("Register admin error:", error)
      throw error
    }
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  static generateToken(admin: Admin): string {
    const secretKey = process.env.JWT_SECRET || "your-secret-key"
    const expiresIn = "24h"

    return jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        username: admin.username
      },
      secretKey,
      { expiresIn },
    )
  }

}
