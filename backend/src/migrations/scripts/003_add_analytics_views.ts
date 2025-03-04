import type { SupabaseClient } from "@supabase/supabase-js"

export async function up(supabase: SupabaseClient) {
    // Create view for daily event counts
    await executeSQL(
        supabase,
        `
    CREATE OR REPLACE VIEW daily_event_counts AS
    SELECT 
      DATE_TRUNC('day', timestamp) AS day,
      event_type,
      COUNT(*) AS event_count
    FROM events
    GROUP BY DATE_TRUNC('day', timestamp), event_type
    ORDER BY day DESC, event_type;
  `,
    )

    // Create view for user activity summary
    await executeSQL(
        supabase,
        `
    CREATE OR REPLACE VIEW user_activity_summary AS
    SELECT 
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.last_active_at,
      COUNT(DISTINCT s.session_id) AS total_sessions,
      COUNT(e.id) AS total_events,
      MAX(e.timestamp) AS last_event_time,
      SUM(CASE WHEN e.event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
      SUM(CASE WHEN e.event_type = 'resource_access' THEN 1 ELSE 0 END) AS resource_accesses,
      SUM(CASE WHEN e.event_type = 'quiz_attempt' THEN 1 ELSE 0 END) AS quiz_attempts,
      AVG(qa.score / NULLIF(qa.max_score, 0)) * 100 AS avg_quiz_score
    FROM users u
    LEFT JOIN events e ON u.user_id = e.user_id
    LEFT JOIN sessions s ON u.user_id = s.user_id
    LEFT JOIN quiz_attempts qa ON u.user_id = qa.user_id
    GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.last_active_at;
  `,
    )

    // Create view for course activity summary
    await executeSQL(
        supabase,
        `
    CREATE OR REPLACE VIEW course_activity_summary AS
    SELECT 
      c.course_id,
      c.title AS course_title,
      COUNT(DISTINCT ce.user_id) AS enrolled_students,
      COUNT(DISTINCT e.id) AS total_events,
      COUNT(DISTINCT ri.id) AS resource_interactions,
      COUNT(DISTINCT qa.id) AS quiz_attempts,
      AVG(qa.score / NULLIF(qa.max_score, 0)) * 100 AS avg_quiz_score
    FROM courses c
    LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id
    LEFT JOIN events e ON ce.user_id = e.user_id
    LEFT JOIN resources r ON c.course_id = r.course_id
    LEFT JOIN resource_interactions ri ON r.resource_id = ri.resource_id
    LEFT JOIN quizzes q ON c.course_id = q.course_id
    LEFT JOIN quiz_attempts qa ON q.quiz_id = qa.quiz_id
    GROUP BY c.course_id, c.title;
  `,
    )

    // Create view for resource popularity
    await executeSQL(
        supabase,
        `
    CREATE OR REPLACE VIEW resource_popularity AS
    SELECT 
      r.resource_id,
      r.title,
      r.type,
      c.course_id,
      c.title AS course_title,
      COUNT(DISTINCT ri.user_id) AS unique_users,
      COUNT(ri.id) AS total_interactions,
      AVG(ri.duration) AS avg_interaction_duration
    FROM resources r
    JOIN courses c ON r.course_id = c.course_id
    LEFT JOIN resource_interactions ri ON r.resource_id = ri.resource_id
    GROUP BY r.resource_id, r.title, r.type, c.course_id, c.title
    ORDER BY unique_users DESC, total_interactions DESC;
  `,
    )
}

export async function down(supabase: SupabaseClient) {
    // Drop all views
    await executeSQL(supabase, `DROP VIEW IF EXISTS resource_popularity;`)
    await executeSQL(supabase, `DROP VIEW IF EXISTS course_activity_summary;`)
    await executeSQL(supabase, `DROP VIEW IF EXISTS user_activity_summary;`)
    await executeSQL(supabase, `DROP VIEW IF EXISTS daily_event_counts;`)
}

// Helper function to execute SQL with Supabase
async function executeSQL(supabase: SupabaseClient, sql: string) {
    const { error } = await supabase.rpc("run_sql", { sql_query: sql })
    if (error) {
        console.error("SQL execution error:", error)
        throw error
    }
}

