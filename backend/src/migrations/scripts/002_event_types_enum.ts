import type { SupabaseClient } from "@supabase/supabase-js"

export async function up(supabase: SupabaseClient) {
    // Create event_type enum
    await supabase.query(`
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
  `)

    // Alter events table to use the enum
    await supabase.query(`
    ALTER TABLE events 
    ALTER COLUMN event_type TYPE event_type USING event_type::event_type;
  `)
}

export async function down(supabase: SupabaseClient) {
    // Revert to text type
    await supabase.query(`
    ALTER TABLE events 
    ALTER COLUMN event_type TYPE TEXT;
  `)

    // Drop the enum type
    await supabase.query(`
    DROP TYPE IF EXISTS event_type;
  `)
}

