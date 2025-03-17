import { Pool, type PoolClient } from "pg"
import dotenv from "dotenv"

dotenv.config()

// Create a connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "cut_analytics",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
})

// Log connection events for debugging
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database")
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err)
  process.exit(-1)
})

/**
 * Execute a SQL query with parameters
 */
export async function query(text: string, params: any[] = []): Promise<any> {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start

    // Log slow queries for performance monitoring
    if (duration > 100) {
      console.log("Slow query:", { text, duration, rows: res.rowCount })
    }

    return res
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect()
  const query = client.query
  const release = client.release

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args: any[]) => {
    client.lastQuery = args
    return query.apply(client, args)
  }

  // Monkey patch the release method to log any unreleased clients
  client.release = () => {
    client.query = query
    client.release = release
    return release.apply(client)
  }

  return client
}

/**
 * Execute a transaction with multiple queries
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

/**
 * Close the pool (use when shutting down the application)
 */
export async function closePool(): Promise<void> {
  await pool.end()
  console.log("Database pool has been closed")
}

export default {
  query,
  getClient,
  transaction,
  closePool,
}

