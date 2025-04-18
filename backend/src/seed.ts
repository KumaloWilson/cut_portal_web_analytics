import { initializeDatabase } from "./models/database"
import { AdminModel } from "./models/admin.model"
import dotenv from "dotenv"

dotenv.config()

async function seedAdmin() {
  try {
    console.log("Initializing database...")
    await initializeDatabase()

    console.log("Checking for existing admin...")
    const existingAdmin = await AdminModel.findByEmail("admin@cut.ac.zw")

    if (!existingAdmin) {
      console.log("Creating default admin user...")
      const admin = await AdminModel.create({
        username: "admin",
        email: "admin@cut.ac.zw",
        password: "Admin@123", // This will be hashed in the create method
      })

      console.log("Default admin user created:", admin.username)
    } else {
      console.log("Admin user already exists")
    }

    console.log("Seeding completed successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedAdmin()
