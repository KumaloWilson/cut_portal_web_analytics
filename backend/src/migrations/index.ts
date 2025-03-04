
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import { supabase } from "../configs/supabase"

dotenv.config()

// Migration metadata table to track which migrations have been run
const MIGRATIONS_TABLE = "migrations"

export async function runMigrations() {
    console.log("Starting database migrations...")

    // Ensure migrations table exists
    await ensureMigrationsTable()

    // Get list of migrations that have been run
    const { data: appliedMigrations, error } = await supabase
        .from(MIGRATIONS_TABLE)
        .select("name")
        .order("executed_at", { ascending: true })

    if (error) {
        console.error("Error fetching applied migrations:", error)
        throw error
    }

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
            await migration.up(supabase)

            // Record that the migration has been run
            await supabase.from(MIGRATIONS_TABLE).insert({
                name: migrationFile,
                executed_at: new Date().toISOString(),
            })

            console.log(`Migration ${migrationFile} completed successfully.`)
        } catch (err) {
            console.error(`Error running migration ${migrationFile}:`, err)
            throw err
        }
    }

    console.log("All migrations completed successfully.")
}

// Update the ensureMigrationsTable function to use the correct Supabase API
async function ensureMigrationsTable() {
    // Connect with admin privileges to create tables if needed
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })

    try {
        // Check if migrations table exists using from().select()
        const { data, error } = await supabaseAdmin.from(MIGRATIONS_TABLE).select("count").limit(1)

        if (error) {
            // Table doesn't exist, create it
            const { error: createError } = await supabaseAdmin
                .from(MIGRATIONS_TABLE)
                .insert({
                    id: 1,
                    name: "init",
                    executed_at: new Date().toISOString(),
                })
                .select()

            if (createError && createError.code === "42P01") {
                // If error is "relation does not exist", create the table using rpc
                const { error: rpcError } = await supabaseAdmin.rpc("create_migrations_table")

                if (rpcError) {
                    console.error("Error creating migrations table:", rpcError)
                    throw rpcError
                }
            }
        }
    } catch (err) {
        console.error("Error checking migrations table:", err)
        throw err
    }
}

