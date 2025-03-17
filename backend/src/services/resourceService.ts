import { query } from "../configs/postgres";

export class ResourceService {
  // Get resources with pagination and filtering
  async getResources(page: number, limit: number, filters: any): Promise<{ resources: any[]; total: number }> {
    let queryText = "SELECT * FROM resources"
    const queryParams: any[] = []
    const conditions: string[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.courseId) {
      conditions.push(`course_id = $${paramIndex++}`)
      queryParams.push(filters.courseId)
    }

    if (filters.type) {
      conditions.push(`type = $${paramIndex++}`)
      queryParams.push(filters.type)
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      queryText += " WHERE " + conditions.join(" AND ")
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) FROM (${queryText}) AS count_query`, queryParams)
    const total = Number.parseInt(countResult.rows[0].count, 10)

    // Apply pagination
    const offset = (page - 1) * limit
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    queryParams.push(limit, offset)

    // Execute the query
    const result = await query(queryText, queryParams)

    return {
      resources: result.rows,
      total,
    }
  }

  // Get a resource by ID
  async getResourceById(resourceId: string): Promise<any> {
    const result = await query("SELECT * FROM resources WHERE resource_id = $1", [resourceId])

    return result.rows[0]
  }

  // Create a resource
  async createResource(resource: any): Promise<any> {
    const result = await query(
      `INSERT INTO resources (
        resource_id, course_id, title, type, url, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [resource.resource_id, resource.course_id, resource.title, resource.type, resource.url, resource.metadata || {}],
    )

    return result.rows[0]
  }

  // Update a resource
  async updateResource(resourceId: string, resourceData: any): Promise<any> {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (resourceData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(resourceData.title)
    }

    if (resourceData.type !== undefined) {
      updates.push(`type = $${paramIndex++}`)
      values.push(resourceData.type)
    }

    if (resourceData.course_id !== undefined) {
      updates.push(`course_id = $${paramIndex++}`)
      values.push(resourceData.course_id)
    }

    if (resourceData.url !== undefined) {
      updates.push(`url = $${paramIndex++}`)
      values.push(resourceData.url)
    }

    if (resourceData.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`)
      values.push(resourceData.metadata)
    }

    // If no updates, return the existing resource
    if (updates.length === 0) {
      return this.getResourceById(resourceId)
    }

    // Add the resourceId to the values array
    values.push(resourceId)

    const result = await query(
      `UPDATE resources SET ${updates.join(", ")} WHERE resource_id = $${paramIndex} RETURNING *`,
      values,
    )

    return result.rows[0]
  }

  // Delete a resource
  async deleteResource(resourceId: string): Promise<boolean> {
    const result = await query("DELETE FROM resources WHERE resource_id = $1 RETURNING *", [resourceId])

    return result.rows.length > 0
  }

  // Get resource interactions
  async getResourceInteractions(
    resourceId: string,
    page: number,
    limit: number,
  ): Promise<{ interactions: any[]; total: number }> {
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await query("SELECT COUNT(*) FROM resource_interactions WHERE resource_id = $1", [resourceId])
    const total = Number.parseInt(countResult.rows[0].count, 10)

    // Get interactions with pagination
    const result = await query(
      "SELECT * FROM resource_interactions WHERE resource_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3",
      [resourceId, limit, offset],
    )

    return {
      interactions: result.rows,
      total,
    }
  }
}

