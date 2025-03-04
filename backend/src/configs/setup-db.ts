import { runMigrations } from "../migrations"
import { supabase } from "./supabase"

/**
 * Initialize the database by running migrations and setting up initial data
 */
export async function initializeDatabase() {
    try {
        console.log("Initializing database...")

        // First, create the run_sql function if it doesn't exist
        await createRunSqlFunction()

        // Then run migrations
        await runMigrations()

        console.log("Database initialization completed successfully")
    } catch (error) {
        console.error("Database initialization failed:", error)
        throw error
    }
}

/**
 * Create the run_sql function needed for migrations
 */
async function createRunSqlFunction() {
    try {
        // Check if the function already exists
        const { data, error } = await supabase.rpc("run_sql", {
            sql_query: "SELECT 1",
        })

        if (error && error.message.includes("function run_sql() does not exist")) {
            // Function doesn't exist, create it using raw SQL
            // Note: This requires admin privileges
            console.log("Creating run_sql function...")

            // We need to use a different approach since we can't use the function that doesn't exist yet
            // This is a bit of a chicken-and-egg problem
            // For Supabase, you might need to run this manually in the SQL editor first
            console.log("Please run the following SQL in the Supabase SQL editor:")
            console.log(`
        CREATE OR REPLACE FUNCTION run_sql(sql_query TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql;
      `)
        }
    } catch (error) {
        console.error("Error creating run_sql function:", error)
        throw error
    }
}

