import { supabase } from "../configs/supabase";


export class QuizService {
    // Get quizzes with pagination and filtering
    async getQuizzes(page: number, limit: number, filters: any): Promise<{ quizzes: any[]; total: number }> {
        let query = supabase.from("quizzes").select("*", { count: "exact" })

        // Apply filters
        if (filters.courseId) {
            query = query.eq("course_id", filters.courseId)
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to).order("created_at", { ascending: false })

        const { data, error, count } = await query

        if (error) {
            console.error("Error getting quizzes:", error)
            throw error
        }

        return {
            quizzes: data || [],
            total: count || 0,
        }
    }

    // Get a quiz by ID
    async getQuizById(quizId: string): Promise<any> {
        const { data, error } = await supabase.from("quizzes").select("*").eq("quiz_id", quizId).single()

        if (error) {
            console.error("Error getting quiz by ID:", error)
            throw error
        }

        return data
    }

    // Create a quiz
    async createQuiz(quiz: any): Promise<any> {
        const { data, error } = await supabase.from("quizzes").insert([quiz]).select()

        if (error) {
            console.error("Error creating quiz:", error)
            throw error
        }

        return data?.[0]
    }

    // Update a quiz
    async updateQuiz(quizId: string, quizData: any): Promise<any> {
        const { data, error } = await supabase.from("quizzes").update(quizData).eq("quiz_id", quizId).select()

        if (error) {
            console.error("Error updating quiz:", error)
            throw error
        }

        return data?.[0]
    }

    // Delete a quiz
    async deleteQuiz(quizId: string): Promise<boolean> {
        const { error } = await supabase.from("quizzes").delete().eq("quiz_id", quizId)

        if (error) {
            console.error("Error deleting quiz:", error)
            throw error
        }

        return true
    }

    // Get quiz attempts
    async getQuizAttempts(
        quizId: string,
        page: number,
        limit: number,
        filters: any,
    ): Promise<{ attempts: any[]; total: number }> {
        let query = supabase.from("quiz_attempts").select("*", { count: "exact" }).eq("quiz_id", quizId)

        // Apply filters
        if (filters.userId) {
            query = query.eq("user_id", filters.userId)
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to).order("start_time", { ascending: false })

        const { data, error, count } = await query

        if (error) {
            console.error("Error getting quiz attempts:", error)
            throw error
        }

        return {
            attempts: data || [],
            total: count || 0,
        }
    }

    // Create a quiz attempt
    async createQuizAttempt(attemptData: any): Promise<any> {
        const { data, error } = await supabase.from("quiz_attempts").insert([attemptData]).select()

        if (error) {
            console.error("Error creating quiz attempt:", error)
            throw error
        }

        return data?.[0]
    }
}

