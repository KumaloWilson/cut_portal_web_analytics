import { closePool } from "../configs/postgres"
import { runMigrations } from "./index"


// This script can be run directly to execute migrations
async function main() {
  try {
    console.log("Starting migrations...")
    await runMigrations()
    console.log("Migrations completed successfully")
    await closePool()
    process.exit(0)
  } catch (error) {
    console.error("Migration failed:", error)
    await closePool()
    process.exit(1)
  }
}

// Run the migrations
main()

