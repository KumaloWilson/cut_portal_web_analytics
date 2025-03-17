import fs from "fs"
import path from "path"
import { query, transaction } from "../postgres"

// Migration metadata table to track which migrations have been run
const MIGRATIONS_TABLE = "migrations"

export async function runMigrations() {
  console.log("Starting database migrations...")

  // Ensure migrations table exists
  await ensureMigrationsTable()

  // Get list of migrations that have been run
  const result = await query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY executed_at ASC`)
  const appliedMigrations = result.rows

  // Get all migration files
  const migrationsDir = path.join(__dirname, "scripts")
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
    .sort() // Sort to ensure migrations run in order

  // Determine which migrations need to be run
  const appliedMigrationNames = appliedMigrations.map((m) => m.name)
  const pendingMigrations = migrationFiles.filter((file) => !appliedMigrationNames.includes(file))

  if (pendingMigrations.length === 0) {
    console.log("No pending migrations to run.")
    return
  }

  console.log(`Found ${pendingMigrations.length} pending migrations.`)

  // Run each pending migration
  for (const migrationFile of pendingMigrations) {
    console.log(`Running migration: ${migrationFile}`)

    try {
      // Import and run the migration
      const migration = require(path.join(migrationsDir, migrationFile))

      // Use a transaction for each migration
      await transaction(async (client) => {
        await migration.up(client)

        // Record that the migration has been run
        await client.query(`INSERT INTO ${MIGRATIONS_TABLE} (name, executed_at) VALUES ($1, $2)`, [
          migrationFile,
          new Date(),
        ])
      })

      console.log(`Migration ${migrationFile} completed successfully.`)
    } catch (err) {
      console.error(`Error running migration ${migrationFile}:`, err)
      throw err
    }
  }

  console.log("All migrations completed successfully.")
}

async function ensureMigrationsTable() {
  try {
    // Check if migrations table exists
    const result = await query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `,
      [MIGRATIONS_TABLE],
    )

    const tableExists = result.rows[0].exists

    if (!tableExists) {
      // Create migrations table
      await query(`
        CREATE TABLE ${MIGRATIONS_TABLE} (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
      console.log(`Created migrations table: ${MIGRATIONS_TABLE}`)
    }
  } catch (error) {
    console.error("Error ensuring migrations table exists:", error)
    throw error
  }
}

