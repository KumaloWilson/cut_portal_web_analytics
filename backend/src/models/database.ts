import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()

// Create database pool
export const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "cut_analytics",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 9000, // How long to wait for a connection to become available
})

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Create students table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        surname VARCHAR(100),
        email VARCHAR(100),
        programme_name VARCHAR(200),
        programme_code VARCHAR(20),
        faculty_name VARCHAR(200),
        level VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create modules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        module_id VARCHAR(20) UNIQUE NOT NULL,
        module_name VARCHAR(200) NOT NULL,
        module_code VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create student_modules table (many-to-many relationship)
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_modules (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) REFERENCES students(student_id),
        module_id VARCHAR(20) REFERENCES modules(module_id),
        period_id VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, module_id, period_id)
      )
    `)

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(50) UNIQUE NOT NULL,
        student_id VARCHAR(20) REFERENCES students(student_id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        total_time_spent INTEGER,
        pages_visited INTEGER DEFAULT 0,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        session_id VARCHAR(50) REFERENCES sessions(session_id),
        student_id VARCHAR(20) REFERENCES students(student_id),
        url TEXT NOT NULL,
        path TEXT NOT NULL,
        page_title TEXT,
        timestamp TIMESTAMP NOT NULL,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create page_views table for analytics
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        page_path TEXT NOT NULL,
        page_title TEXT,
        view_count INTEGER DEFAULT 0,
        total_time_spent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create student_activity table for analytics
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_activity (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) REFERENCES students(student_id),
        date DATE NOT NULL,
        session_count INTEGER DEFAULT 0,
        total_time_spent INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        interactions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, date)
      )
    `)

    // Create admins table for authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query("COMMIT")
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
}
