import type { PoolClient } from "pg"

export async function up(client: PoolClient) {
  // Create a reference table for event types instead of using an enum
  await client.query(`
    CREATE TABLE IF NOT EXISTS event_types (
      event_type TEXT PRIMARY KEY,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // Insert all event types
  await client.query(`
    INSERT INTO event_types (event_type, description)
    VALUES
      ('page_view', 'Page view event'),
      ('button_click', 'Button click event'),
      ('form_submit', 'Form submission event'),
      ('page_exit', 'Page exit event'),
      ('resource_access', 'Resource access event'),
      ('video_interaction', 'Video interaction event'),
      ('quiz_attempt', 'Quiz attempt event'),
      ('login', 'Login event'),
      ('logout', 'Logout event'),
      ('search', 'Search event'),
      ('navigation', 'Navigation event'),
      ('download', 'Download event'),
      ('upload', 'Upload event'),
      ('comment', 'Comment event'),
      ('discussion_post', 'Discussion post event'),
      ('assignment_submission', 'Assignment submission event'),
      ('notification_click', 'Notification click event'),
      ('error', 'Error event'),
      ('module_list_view', 'Module list view event'),
      ('past_exam_access', 'Past exam access event'),
      ('payment_interaction', 'Payment interaction event'),
      ('results_view', 'Results view event'),
      ('profile_view', 'Profile view event'),
      ('bursary_view', 'Bursary view event')
    ON CONFLICT (event_type) DO NOTHING;
  `)

  // Ensure events table has event_type as TEXT
  await client.query(`
    ALTER TABLE events 
    ALTER COLUMN event_type TYPE TEXT;
  `)

  // Add a foreign key constraint to ensure valid event types
  await client.query(`
    ALTER TABLE events
    ADD CONSTRAINT fk_event_type
    FOREIGN KEY (event_type)
    REFERENCES event_types(event_type)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
  `)
}

export async function down(client: PoolClient) {
  // Remove the foreign key constraint
  await client.query(`
    ALTER TABLE events
    DROP CONSTRAINT IF EXISTS fk_event_type;
  `)

  // Drop the event_types table
  await client.query(`
    DROP TABLE IF EXISTS event_types;
  `)
}


