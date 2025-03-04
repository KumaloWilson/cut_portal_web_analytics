import { supabase } from "../configs/supabase";

export class CourseService {
    // Get courses with pagination and filtering
    async getCourses(page: number, limit: number, filters: any): Promise<{ courses: any[]; total: number }> {
        let query = supabase.from("courses").select("*", { count: "exact" })

        // Apply filters
        if (filters.search) {
            query = query.or(
                `course_id.ilike.%${filters.search}%,title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
            )
        }

        if (filters.instructorId) {
            query = query.eq("instructor_id", filters.instructorId)
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to).order("created_at", { ascending: false })

        const { data, error, count } = await query

        if (error) {
            console.error("Error getting courses:", error)
            throw error
        }

        return {
            courses: data || [],
            total: count || 0,
        }
    }

    // Get a course by ID
    async getCourseById(courseId: string): Promise<any> {
        const { data, error } = await supabase.from("courses").select("*").eq("course_id", courseId).single()

        if (error) {
            console.error("Error getting course by ID:", error)
            throw error
        }

        return data
    }

    // Create a course
    async createCourse(course: any): Promise<any> {
        const { data, error } = await supabase.from("courses").insert([course]).select()

        if (error) {
            console.error("Error creating course:", error)
            throw error
        }

        return data?.[0]
    }

    // Update a course
    async updateCourse(courseId: string, courseData: any): Promise<any> {
        const { data, error } = await supabase.from("courses").update(courseData).eq("course_id", courseId).select()

        if (error) {
            console.error("Error updating course:", error)
            throw error
        }

        return data?.[0]
    }

    // Delete a course
    async deleteCourse(courseId: string): Promise<boolean> {
        const { error } = await supabase.from("courses").delete().eq("course_id", courseId)

        if (error) {
            console.error("Error deleting course:", error)
            throw error
        }

        return true
    }

    // Get course activity
    async getCourseActivity(courseId: string, days: number): Promise<any> {
        const { data, error } = await supabase.rpc("get_course_activity_stats", {
            course_id_param: courseId,
            days_back: days,
        })

        if (error) {
            console.error("Error getting course activity:", error)
            throw error
        }

        return data || []
    }

    // Get course users
    async getCourseUsers(
        courseId: string,
        page: number,
        limit: number,
        filters: any,
    ): Promise<{ users: any[]; total: number }> {
        let query = supabase
            .from("course_enrollments")
            .select(
                `
        role,
        enrolled_at,
        last_accessed_at,
        users:user_id(
          user_id,
          first_name,
          last_name,
          email,
          role,
          last_active_at
        )
      `,
                { count: "exact" },
            )
            .eq("course_id", courseId)

        // Apply filters
        if (filters.role) {
            query = query.eq("role", filters.role)
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to).order("enrolled_at", { ascending: false })

        const { data, error, count } = await query

        if (error) {
            console.error("Error getting course users:", error)
            throw error
        }

        return {
            users: data || [],
            total: count || 0,
        }
    }

    // Get course resources
    async getCourseResources(courseId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from("resources")
            .select("*")
            .eq("course_id", courseId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error getting course resources:", error)
            throw error
        }

        return data || []
    }

    // Get course quizzes
    async getCourseQuizzes(courseId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from("quizzes")
            .select("*")
            .eq("course_id", courseId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error getting course quizzes:", error)
            throw error
        }

        return data || []
    }
}

