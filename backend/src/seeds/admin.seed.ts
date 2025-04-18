import { AdminModel } from "../models/admin.model"
import { pool, initializeDatabase } from "../models/database"
import dotenv from "dotenv"

dotenv.config()

async function seedAdmin() {
  try {
    // Ensure database tables exist
    await initializeDatabase()

    // Check if admin already exists
    const existingAdmin = await AdminModel.findByEmail("admin@cut.ac.zw")

    if (!existingAdmin) {
      // Create default admin user
      const admin = await AdminModel.create({
        username: "admin",
        email: "admin@cut.ac.zw",
        password: "Admin@123", // This will be hashed in the create method
      })

      console.log("Default admin user created:", admin.username)
    } else {
      console.log("Admin user already exists")
    }
  } catch (error) {
    console.error("Error seeding admin:", error)
  } finally {
    // Close the database connection
    await pool.end()
  }
}

// Run the seed function
seedAdmin()
