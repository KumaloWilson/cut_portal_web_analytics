import { supabase } from "../configs/supabase";

export class ResourceService {
    // Get resources with pagination and filtering
    async getResources(page: number, limit: number, filters: any): Promise<{ resources: any[]; total: number }> {
        let query = supabase.from("resources").select("*", { count: "exact" })

        // Apply filters
        if (filters.courseId) {
            query = query.eq("course_id", filters.courseId)
        }

        if (filters.type) {
            query = query.eq("type", filters.type)
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to).order("created_at", { ascending: false })

        const { data, error, count } = await query

        if (error) {
            console.error("Error getting resources:", error)
            throw error
        }

        return {
            resources: data || [],
            total: count || 0,
        }
    }

    // Get a resource by ID
    async getResourceById(resourceId: string): Promise<any> {
        const { data, error } = await supabase.from("resources").select("*").eq("resource_id", resourceId).single()

        if (error) {
            console.error("Error getting resource by ID:", error)
            throw error
        }

        return data
    }

    // Create a resource
    async createResource(resource: any): Promise<any> {
        const { data, error } = await supabase.from("resources").insert([resource]).select()

        if (error) {
            console.error("Error creating resource:", error)
            throw error
        }

        return data?.[0]
    }

    // Update a resource
    async updateResource(resourceId: string, resourceData: any): Promise<any> {
        const { data, error } = await supabase.from("resources").update(resourceData).eq("resource_id", resourceId).select()

        if (error) {
            console.error("Error updating resource:", error)
            throw error
        }

        return data?.[0]
    }

    // Delete a resource
    async deleteResource(resourceId: string): Promise<boolean> {
        const { error } = await supabase.from("resources").delete().eq("resource_id", resourceId)

        if (error) {
            console.error("Error deleting resource:", error)
            throw error
        }

        return true
    }

    // Get resource interactions
    async getResourceInteractions(
        resourceId: string,
        page: number,
        limit: number,
    ): Promise<{ interactions: any[]; total: number }> {
        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, error, count } = await supabase
            .from("resource_interactions")
            .select("*", { count: "exact" })
            .eq("resource_id", resourceId)
            .range(from, to)
            .order("timestamp", { ascending: false })

        if (error) {
            console.error("Error getting resource interactions:", error)
            throw error
        }

        return {
            interactions: data || [],
            total: count || 0,
        }
    }
}

