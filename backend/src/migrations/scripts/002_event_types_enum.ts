import type { SupabaseClient } from "@supabase/supabase-js"

export async function up(supabase: SupabaseClient) {
    // Create event_type enum
    await executeSQL(
        supabase,
        `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM (
          'page_view',
          'button_click',
          'form_submit',
          'page_exit',
          'resource_access',
          'video_interaction',
          'quiz_attempt',
          'login',
          'logout',
          'search',
          'navigation',
          'download',
          'upload',
          'comment',
          'discussion_post',
          'assignment_submission',
          'notification_click',
          'error'
        );
      END IF;
    END
    $$;
  `,
    )

    // Alter events table to use the enum
    await executeSQL(
        supabase,
        `
    ALTER TABLE events 
    ALTER COLUMN event_type TYPE event_type USING event_type::event_type;
  `,
    )
}

export async function down(supabase: SupabaseClient) {
    // Revert to text type
    await executeSQL(
        supabase,
        `
    ALTER TABLE events 
    ALTER COLUMN event_type TYPE TEXT;
  `,
    )

    // Drop the enum type
    await executeSQL(
        supabase,
        `
    DROP TYPE IF EXISTS event_type;
  `,
    )
}

// Helper function to execute SQL with Supabase
async function executeSQL(supabase: SupabaseClient, sql: string) {
    const { error } = await supabase.rpc("run_sql", { sql_query: sql })
    if (error) {
        console.error("SQL execution error:", error)
        throw error
    }
}

