import { runMigrations } from "./migrations"

/**
 * Initialize the database by running migrations and setting up initial data
 */
export async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Run migrations
    await runMigrations()

    console.log("Database initialization completed successfully")
  } catch (error) {
    console.error("Database initialization failed:", error)
    throw error
  }
}

