import type { PoolClient } from "pg"

export async function up(client: PoolClient) {
  // Create event_type enum
  await client.query(`
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
  await client.query(`
    ALTER TABLE events 
    ALTER COLUMN event_type TYPE event_type USING event_type::event_type;
  `)
}

export async function down(client: PoolClient) {
  // Revert to text type
  await client.query(`
    ALTER TABLE events 
    ALTER COLUMN event_type TYPE TEXT;
  `)

  // Drop the enum type
  await client.query(`
    DROP TYPE IF EXISTS event_type;
  `)
}

