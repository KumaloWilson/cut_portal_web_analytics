import { pool } from "./database"



export class AnalyticsModel {
  static async updatePageView(path: string, title: string | null): Promise<void> {
    const pageCheck = await pool.query("SELECT id FROM page_views WHERE page_path = $1", [path])

    if (pageCheck.rowCount === 0) {
      // Create new page view entry
      await pool.query(
        `INSERT INTO page_views 
         (page_path, page_title, view_count) 
         VALUES ($1, $2, 1)`,
        [path, title],
      )
    } else {
      // Update existing page view entry
      await pool.query(
        `UPDATE page_views 
         SET view_count = view_count + 1, 
             page_title = COALESCE($1, page_title),
             updated_at = CURRENT_TIMESTAMP
         WHERE page_path = $2`,
        [title, path],
      )
    }
  }

  static async updateStudentActivity(
    studentId: string,
    date: string,
    sessionCount = 0,
    timeSpent = 0,
    pageViews = 0,
    interactions = 0,
  ): Promise<void> {
    const activityCheck = await pool.query("SELECT id FROM student_activity WHERE student_id = $1 AND date = $2", [
      studentId,
      date,
    ])

    if (activityCheck.rowCount === 0) {
      // Create new entry
      await pool.query(
        `INSERT INTO student_activity 
         (student_id, date, session_count, total_time_spent, page_views, interactions) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [studentId, date, sessionCount, timeSpent, pageViews, interactions],
      )
    } else {
      // Update existing entry
      await pool.query(
        `UPDATE student_activity 
         SET session_count = session_count + $3, 
             total_time_spent = total_time_spent + $4, 
             page_views = page_views + $5,
             interactions = interactions + $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE student_id = $1 AND date = $2`,
        [studentId, date, sessionCount, timeSpent, pageViews, interactions],
      )
    }
  }

  static async getTopPages(limit = 10): Promise<any[]> {
    const result = await pool.query(
      `SELECT page_path, page_title, view_count 
       FROM page_views 
       ORDER BY view_count DESC 
       LIMIT $1`,
      [limit],
    )

    return result.rows
  }

  static async getActivityOverTime(days = 30): Promise<any[]> {
    const result = await pool.query(
      `SELECT date, 
              SUM(session_count) as sessions, 
              SUM(page_views) as page_views, 
              SUM(interactions) as interactions
       FROM student_activity
       WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY date
       ORDER BY date ASC`,
    )

    return result.rows
  }

  static async getStudentEngagement(): Promise<any[]> {
    const result = await pool.query(
      `SELECT s.student_id, 
              s.first_name, 
              s.surname, 
              COUNT(DISTINCT se.session_id) as session_count,
              SUM(se.total_time_spent) as total_time_spent,
              COUNT(e.id) as event_count
       FROM students s
       LEFT JOIN sessions se ON s.student_id = se.student_id
       LEFT JOIN events e ON s.student_id = e.student_id
       GROUP BY s.student_id, s.first_name, s.surname
       ORDER BY total_time_spent DESC NULLS LAST`,
    )

    return result.rows
  }

  static async getModuleEngagement(): Promise<any[]> {
    const result = await pool.query(
      `SELECT m.module_id, 
              m.module_name, 
              m.module_code,
              COUNT(DISTINCT sm.student_id) as student_count,
              COUNT(e.id) as event_count
       FROM modules m
       LEFT JOIN student_modules sm ON m.module_id = sm.module_id
       LEFT JOIN events e ON e.path LIKE '%' || m.module_code || '%'
       GROUP BY m.module_id, m.module_name, m.module_code
       ORDER BY event_count DESC NULLS LAST`,
    )

    return result.rows
  }
}

