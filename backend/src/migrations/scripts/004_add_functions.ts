import type { PoolClient } from "pg"

export async function up(client: PoolClient) {
  // Function to check if a table exists
  await client.query(`
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

  // Function to get student activity stats
  await client.query(`
    CREATE OR REPLACE FUNCTION get_student_activity_stats(student_id_param TEXT, days_back INTEGER DEFAULT 30)
    RETURNS TABLE (
      day DATE,
      event_count INTEGER,
      page_views INTEGER,
      resource_accesses INTEGER,
      module_views INTEGER,
      past_exam_accesses INTEGER,
      time_spent INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        DATE_TRUNC('day', e.timestamp)::DATE AS day,
        COUNT(e.id) AS event_count,
        SUM(CASE WHEN e.event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
        SUM(CASE WHEN e.event_type = 'resource_access' THEN 1 ELSE 0 END) AS resource_accesses,
        SUM(CASE WHEN e.event_type = 'module_list_view' THEN 1 ELSE 0 END) AS module_views,
        SUM(CASE WHEN e.event_type = 'past_exam_access' THEN 1 ELSE 0 END) AS past_exam_accesses,
        COALESCE(SUM(e.duration), 0) AS time_spent
      FROM events e
      WHERE e.student_id = student_id_param
        AND e.timestamp >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
      GROUP BY DATE_TRUNC('day', e.timestamp)::DATE
      ORDER BY day;
    END;
    $$ LANGUAGE plpgsql;
  `)

  // Function to get module activity stats
  await client.query(`
    CREATE OR REPLACE FUNCTION get_module_activity_stats(module_id_param TEXT, days_back INTEGER DEFAULT 30)
    RETURNS TABLE (
      day DATE,
      active_students INTEGER,
      event_count INTEGER,
      resource_accesses INTEGER,
      quiz_attempts INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        DATE_TRUNC('day', e.timestamp)::DATE AS day,
        COUNT(DISTINCT e.student_id) AS active_students,
        COUNT(e.id) AS event_count,
        SUM(CASE WHEN e.event_type = 'resource_access' THEN 1 ELSE 0 END) AS resource_accesses,
        SUM(CASE WHEN e.event_type = 'quiz_attempt' THEN 1 ELSE 0 END) AS quiz_attempts
      FROM events e
      JOIN module_enrollments me ON e.student_id = me.student_id
      WHERE me.module_id = module_id_param
        AND e.timestamp >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
      GROUP BY DATE_TRUNC('day', e.timestamp)::DATE
      ORDER BY day;
    END;
    $$ LANGUAGE plpgsql;
  `)

  // Function to get faculty stats
  await client.query(`
    CREATE OR REPLACE FUNCTION get_faculty_stats()
    RETURNS TABLE (
      faculty_code TEXT,
      faculty_name TEXT,
      student_count INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        s.faculty_code,
        s.faculty_name,
        COUNT(DISTINCT s.student_id) AS student_count
      FROM students s
      WHERE s.faculty_code IS NOT NULL
      GROUP BY s.faculty_code, s.faculty_name
      ORDER BY student_count DESC;
    END;
    $$ LANGUAGE plpgsql;
  `)

  // Function to get program stats
  await client.query(`
    CREATE OR REPLACE FUNCTION get_program_stats()
    RETURNS TABLE (
      program_code TEXT,
      program_name TEXT,
      faculty_code TEXT,
      student_count INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        s.program_code,
        s.program_name,
        s.faculty_code,
        COUNT(DISTINCT s.student_id) AS student_count
      FROM students s
      WHERE s.program_code IS NOT NULL
      GROUP BY s.program_code, s.program_name, s.faculty_code
      ORDER BY student_count DESC;
    END;
    $$ LANGUAGE plpgsql;
  `)

  // Function to get level stats
  await client.query(`
    CREATE OR REPLACE FUNCTION get_level_stats()
    RETURNS TABLE (
      level TEXT,
      student_count INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        s.level,
        COUNT(DISTINCT s.student_id) AS student_count
      FROM students s
      WHERE s.level IS NOT NULL
      GROUP BY s.level
      ORDER BY s.level;
    END;
    $$ LANGUAGE plpgsql;
  `)
}

export async function down(client: PoolClient) {
  // Drop all functions
  await client.query(`DROP FUNCTION IF EXISTS get_level_stats;`)
  await client.query(`DROP FUNCTION IF EXISTS get_program_stats;`)
  await client.query(`DROP FUNCTION IF EXISTS get_faculty_stats;`)
  await client.query(`DROP FUNCTION IF EXISTS get_module_activity_stats;`)
  await client.query(`DROP FUNCTION IF EXISTS get_student_activity_stats;`)
  await client.query(`DROP FUNCTION IF EXISTS check_table_exists;`)
}

