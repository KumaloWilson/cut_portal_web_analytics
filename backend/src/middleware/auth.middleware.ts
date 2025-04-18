import type { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.service"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header or cookies
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    // Verify token
    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token." })
    }

    // Add user to request
    req.user = decoded
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
