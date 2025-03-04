import { supabase } from "../configs/supabase";


export class UserService {
    // Get users with pagination and filtering
    async getUsers(page: number, limit: number, filters: any): Promise<{ users: any[]; total: number }> {
        let query = supabase.from("users").select("*", { count: "exact" })

        // Apply filters
        if (filters.search) {
            query = query.or(
                `user_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`,
            )
        }

        if (filters.role) {
            query = query.eq("role", filters.role)
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to).order("created_at", { ascending: false })

        const { data, error, count } = await query

        if (error) {
            console.error("Error getting users:", error)
            throw error
        }

        return {
            users: data || [],
            total: count || 0,
        }
    }

    // Get a user by ID
    async getUserById(userId: string): Promise<any> {
        const { data, error } = await supabase.from("users").select("*").eq("user_id", userId).single()

        if (error) {
            console.error("Error getting user by ID:", error)
            throw error
        }

        return data
    }

    // Create a user
    async createUser(user: any): Promise<any> {
        const { data, error } = await supabase.from("users").insert([user]).select()

        if (error) {
            console.error("Error creating user:", error)
            throw error
        }

        return data?.[0]
    }

    // Update a user
    async updateUser(userId: string, userData: any): Promise<any> {
        const { data, error } = await supabase.from("users").update(userData).eq("user_id", userId).select()

        if (error) {
            console.error("Error updating user:", error)
            throw error
        }

        return data?.[0]
    }

    // Delete a user
    async deleteUser(userId: string): Promise<boolean> {
        const { error } = await supabase.from("users").delete().eq("user_id", userId)

        if (error) {
            console.error("Error deleting user:", error)
            throw error
        }

        return true
    }

    // Get user activity
    async getUserActivity(userId: string, days: number): Promise<any> {
        const { data, error } = await supabase.rpc("get_user_activity_stats", {
            user_id_param: userId,
            days_back: days,
        })

        if (error) {
            console.error("Error getting user activity:", error)
            throw error
        }

        return data || []
    }

    // Get user courses
    async getUserCourses(userId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from("course_enrollments")
            .select(`
        role,
        enrolled_at,
        last_accessed_at,
        courses:course_id(
          course_id,
          title,
          description,
          instructor_id,
          created_at,
          metadata
        )
      `)
            .eq("user_id", userId)

        if (error) {
            console.error("Error getting user courses:", error)
            throw error
        }

        return data || []
    }
}

