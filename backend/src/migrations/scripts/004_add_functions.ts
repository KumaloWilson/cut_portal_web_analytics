import type { SupabaseClient } from "@supabase/supabase-js"

export async function up(supabase: SupabaseClient) {
    // Function to check if a table exists
    await supabase.query(`
    CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
    RETURNS BOOLEAN AS $$
    DECLARE
      table_exists BOOLEAN;
    BEGIN
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) INTO table_exists;
      
      RETURN table_exists;
    END;
    $$ LANGUAGE plpgsql;
  `)

    // Function to create migrations table
    await supabase.query(`
    CREATE OR REPLACE FUNCTION create_migrations_table()
    RETURNS VOID AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    END;
    $$ LANGUAGE plpgsql;
  `)

    // Function to get user activity stats
    await supabase.query(`
    CREATE OR REPLACE FUNCTION get_user_activity_stats(user_id_param TEXT, days_back INTEGER DEFAULT 30)
    RETURNS TABLE (
      day DATE,
      event_count INTEGER,
      page_views INTEGER,
      resource_accesses INTEGER,
      quiz_attempts INTEGER,
      time_spent INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        DATE_TRUNC('day', e.timestamp)::DATE AS day,
        COUNT(e.id) AS event_count,
        SUM(CASE WHEN e.event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
        SUM(CASE WHEN e.event_type = 'resource_access' THEN 1 ELSE 0 END) AS resource_accesses,
        SUM(CASE WHEN e.event_type = 'quiz_attempt' THEN 1 ELSE 0 END) AS quiz_attempts,
        COALESCE(SUM(e.duration), 0) AS time_spent
      FROM events e
      WHERE e.user_id = user_id_param
        AND e.timestamp >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
      GROUP BY DATE_TRUNC('day', e.timestamp)::DATE
      ORDER BY day;
    END;
    $$ LANGUAGE plpgsql;
  `)

    // Function to get course activity stats
    await supabase.query(`
    CREATE OR REPLACE FUNCTION get_course_activity_stats(course_id_param TEXT, days_back INTEGER DEFAULT 30)
    RETURNS TABLE (
      day DATE,
      active_users INTEGER,
      event_count INTEGER,
      resource_accesses INTEGER,
      quiz_attempts INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        DATE_TRUNC('day', e.timestamp)::DATE AS day,
        COUNT(DISTINCT e.user_id) AS active_users,
        COUNT(e.id) AS event_count,
        SUM(CASE WHEN e.event_type = 'resource_access' THEN 1 ELSE 0 END) AS resource_accesses,
        SUM(CASE WHEN e.event_type = 'quiz_attempt' THEN 1 ELSE 0 END) AS quiz_attempts
      FROM events e
      JOIN course_enrollments ce ON e.user_id = ce.user_id
      WHERE ce.course_id = course_id_param
        AND e.timestamp >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
      GROUP BY DATE_TRUNC('day', e.timestamp)::DATE
      ORDER BY day;
    END;
    $$ LANGUAGE plpgsql;
  `)
}

export async function down(supabase: SupabaseClient) {
    // Drop all functions
    await supabase.query(`
    DROP FUNCTION IF EXISTS get_course_activity_stats;
    DROP FUNCTION IF EXISTS get_user_activity_stats;
    DROP FUNCTION IF EXISTS create_migrations_table;
    DROP FUNCTION IF EXISTS check_table_exists;
  `)
}

