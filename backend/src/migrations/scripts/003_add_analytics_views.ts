import type { PoolClient } from "pg"

export async function up(client: PoolClient) {
  // Create view for daily event counts
  await client.query(`
    CREATE OR REPLACE VIEW daily_event_counts AS
    SELECT 
      DATE_TRUNC('day', timestamp) AS day,
      event_type,
      COUNT(*) AS event_count
    FROM events
    GROUP BY DATE_TRUNC('day', timestamp), event_type
    ORDER BY day DESC, event_type;
  `)

  // Create view for user activity summary
  await client.query(`
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
      SUM(CASE WHEN e.event_type = 'quiz_attempt' THEN 1 ELSE 0 END) AS quiz_attempts
    FROM users u
    LEFT JOIN events e ON u.user_id = e.user_id
    LEFT JOIN sessions s ON u.user_id = s.user_id
    GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.last_active_at;
  `)

  // Create view for student activity summary
  await client.query(`
    CREATE OR REPLACE VIEW student_activity_summary AS
    SELECT 
      s.student_id,
      s.first_name,
      s.last_name,
      s.email,
      s.program_code,
      s.program_name,
      s.faculty_code,
      s.faculty_name,
      s.level,
      s.last_active_at,
      COUNT(DISTINCT sess.session_id) AS total_sessions,
      COUNT(e.id) AS total_events,
      MAX(e.timestamp) AS last_event_time,
      SUM(CASE WHEN e.event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
      SUM(CASE WHEN e.event_type = 'resource_access' THEN 1 ELSE 0 END) AS resource_accesses,
      SUM(CASE WHEN e.event_type = 'module_list_view' THEN 1 ELSE 0 END) AS module_views,
      SUM(CASE WHEN e.event_type = 'past_exam_access' THEN 1 ELSE 0 END) AS past_exam_accesses
    FROM students s
    LEFT JOIN events e ON s.student_id = e.student_id
    LEFT JOIN sessions sess ON s.student_id = sess.student_id
    GROUP BY s.student_id, s.first_name, s.last_name, s.email, s.program_code, s.program_name, 
             s.faculty_code, s.faculty_name, s.level, s.last_active_at;
  `)

  // Create view for module activity summary
  await client.query(`
    CREATE OR REPLACE VIEW module_activity_summary AS
    SELECT 
      m.module_id,
      m.module_code,
      m.title AS module_title,
      COUNT(DISTINCT me.student_id) AS enrolled_students,
      COUNT(DISTINCT e.id) AS total_events,
      COUNT(DISTINCT ri.id) AS resource_interactions,
      COUNT(DISTINCT qa.id) AS quiz_attempts
    FROM modules m
    LEFT JOIN module_enrollments me ON m.module_id = me.module_id
    LEFT JOIN events e ON (me.student_id = e.student_id AND e.details->>'moduleId' = m.module_id)
    LEFT JOIN resources r ON m.module_id = r.module_id
    LEFT JOIN resource_interactions ri ON r.resource_id = ri.resource_id
    LEFT JOIN quizzes q ON m.module_id = q.module_id
    LEFT JOIN quiz_attempts qa ON q.quiz_id = qa.quiz_id
    GROUP BY m.module_id, m.module_code, m.title;
  `)

  // Create view for resource popularity
  await client.query(`
    CREATE OR REPLACE VIEW resource_popularity AS
    SELECT 
      r.resource_id,
      r.title,
      r.type,
      m.module_id,
      m.title AS module_title,
      COUNT(DISTINCT ri.student_id) AS unique_users,
      COUNT(ri.id) AS total_interactions,
      AVG(ri.duration) AS avg_interaction_duration
    FROM resources r
    LEFT JOIN modules m ON r.module_id = m.module_id
    LEFT JOIN resource_interactions ri ON r.resource_id = ri.resource_id
    GROUP BY r.resource_id, r.title, r.type, m.module_id, m.title
    ORDER BY unique_users DESC, total_interactions DESC;
  `)
}

export async function down(client: PoolClient) {
  // Drop all views
  await client.query(`DROP VIEW IF EXISTS resource_popularity;`)
  await client.query(`DROP VIEW IF EXISTS module_activity_summary;`)
  await client.query(`DROP VIEW IF EXISTS student_activity_summary;`)
  await client.query(`DROP VIEW IF EXISTS user_activity_summary;`)
  await client.query(`DROP VIEW IF EXISTS daily_event_counts;`)
}

