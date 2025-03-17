import type { PoolClient } from "pg"

export async function up(client: PoolClient) {
  // Enable UUID extension if not already enabled
  await client.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)

  // Create users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id TEXT NOT NULL UNIQUE,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      role TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_active_at TIMESTAMPTZ,
      metadata JSONB
    );
  `)

  // Create events table with expanded fields
  await client.query(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_type TEXT NOT NULL,
      user_id TEXT REFERENCES users(user_id),
      url TEXT NOT NULL,
      path TEXT NOT NULL,
      details JSONB NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      session_id TEXT,
      device_info JSONB,
      browser_info JSONB,
      ip_address TEXT,
      referrer TEXT,
      duration INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // Create sessions table
  await client.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id TEXT NOT NULL UNIQUE,
      user_id TEXT REFERENCES users(user_id),
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      duration INTEGER,
      device_info JSONB,
      browser_info JSONB,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // Create courses table
  await client.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      course_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      instructor_id TEXT REFERENCES users(user_id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB
    );
  `)

  // Create course_enrollments table
  await client.query(`
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      course_id TEXT REFERENCES courses(course_id),
      user_id TEXT REFERENCES users(user_id),
      role TEXT NOT NULL,
      enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_accessed_at TIMESTAMPTZ,
      UNIQUE(course_id, user_id)
    );
  `)

  // Create resources table
  await client.query(`
    CREATE TABLE IF NOT EXISTS resources (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      resource_id TEXT NOT NULL UNIQUE,
      course_id TEXT REFERENCES courses(course_id),
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB
    );
  `)

  // Create resource_interactions table
  await client.query(`
    CREATE TABLE IF NOT EXISTS resource_interactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      resource_id TEXT REFERENCES resources(resource_id),
      user_id TEXT REFERENCES users(user_id),
      interaction_type TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      duration INTEGER,
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // Create quizzes table
  await client.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      quiz_id TEXT NOT NULL UNIQUE,
      course_id TEXT REFERENCES courses(course_id),
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB
    );
  `)

  // Create quiz_attempts table
  await client.query(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      quiz_id TEXT REFERENCES quizzes(quiz_id),
      user_id TEXT REFERENCES users(user_id),
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      score NUMERIC,
      max_score NUMERIC,
      duration INTEGER,
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // Create analytics_cache table for storing pre-computed analytics
  await client.query(`
    CREATE TABLE IF NOT EXISTS analytics_cache (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      cache_key TEXT NOT NULL UNIQUE,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ
    );
  `)

  // Create indexes for performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
    CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_events_path ON events(path);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_resource_interactions_user_id ON resource_interactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_resource_interactions_resource_id ON resource_interactions(resource_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
  `)
}

export async function down(client: PoolClient) {
  // Drop tables in reverse order to avoid foreign key constraints
  await client.query(`DROP TABLE IF EXISTS analytics_cache;`)
  await client.query(`DROP TABLE IF EXISTS quiz_attempts;`)
  await client.query(`DROP TABLE IF EXISTS quizzes;`)
  await client.query(`DROP TABLE IF EXISTS resource_interactions;`)
  await client.query(`DROP TABLE IF EXISTS resources;`)
  await client.query(`DROP TABLE IF EXISTS course_enrollments;`)
  await client.query(`DROP TABLE IF EXISTS courses;`)
  await client.query(`DROP TABLE IF EXISTS events;`)
  await client.query(`DROP TABLE IF EXISTS sessions;`)
  await client.query(`DROP TABLE IF EXISTS users;`)
}

