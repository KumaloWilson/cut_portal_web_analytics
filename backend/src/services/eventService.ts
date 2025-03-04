import { supabase } from "../configs/supabase";
import { TrackingEvent } from "../types/events";


export class EventService {
    // Create a single event
    async createEvent(event: TrackingEvent): Promise<any> {
        // First, ensure the user exists
        if (event.userId) {
            await this.ensureUserExists(event.userId)
        }

        // Then, ensure the session exists
        if (event.sessionId) {
            await this.ensureSessionExists(event.sessionId, event.userId, event.deviceInfo, event.browserInfo)
        }

        // If this is a resource access event, ensure the resource exists
        if (event.eventType === "resource_access" && event.details?.resourceId) {
            await this.ensureResourceExists(
                event.details.resourceId,
                event.details.resourceTitle,
                event.details.resourceType,
                event.details.courseId,
            )
        }

        // If this is a quiz attempt event, ensure the quiz exists
        if (event.eventType === "quiz_attempt" && event.details?.quizId) {
            await this.ensureQuizExists(event.details.quizId, event.details.quizTitle, event.details.courseId)
        }

        const { data, error } = await supabase
            .from("events")
            .insert([
                {
                    event_type: event.eventType,
                    user_id: event.userId,
                    url: event.url,
                    path: event.path,
                    details: event.details,
                    timestamp: event.timestamp,
                    session_id: event.sessionId,
                    device_info: event.deviceInfo,
                    browser_info: event.browserInfo,
                    ip_address: event.ipAddress,
                    referrer: event.referrer,
                    duration: event.duration,
                },
            ])
            .select()

        if (error) {
            console.error("Error creating event:", error)
            throw error
        }

        return data
    }

    // Ensure user exists in the database
    private async ensureUserExists(userId: string): Promise<void> {
        // Check if user exists
        const { data: existingUser } = await supabase.from("users").select("user_id").eq("user_id", userId).single()

        if (!existingUser) {
            // Create new user
            const { error } = await supabase.from("users").insert([
                {
                    user_id: userId,
                    last_active_at: new Date().toISOString(),
                },
            ])

            if (error) {
                console.error("Error creating user:", error)
            }
        } else {
            // Update last active time
            await supabase.from("users").update({ last_active_at: new Date().toISOString() }).eq("user_id", userId)
        }
    }

    // Ensure session exists in the database
    private async ensureSessionExists(
        sessionId: string,
        userId: string | null,
        deviceInfo?: any,
        browserInfo?: any,
    ): Promise<void> {
        // Check if session exists
        const { data: existingSession } = await supabase
            .from("sessions")
            .select("session_id")
            .eq("session_id", sessionId)
            .single()

        if (!existingSession) {
            // Create new session
            const { error } = await supabase.from("sessions").insert([
                {
                    session_id: sessionId,
                    user_id: userId,
                    start_time: new Date().toISOString(),
                    device_info: deviceInfo,
                    browser_info: browserInfo,
                },
            ])

            if (error) {
                console.error("Error creating session:", error)
            }
        }
    }

    // Ensure resource exists in the database
    private async ensureResourceExists(
        resourceId: string,
        title: string,
        type: string,
        courseId?: string,
    ): Promise<void> {
        // Check if resource exists
        const { data: existingResource } = await supabase
            .from("resources")
            .select("resource_id")
            .eq("resource_id", resourceId)
            .single()

        if (!existingResource) {
            // Create new resource
            const { error } = await supabase.from("resources").insert([
                {
                    resource_id: resourceId,
                    title: title || resourceId,
                    type: type || "unknown",
                    course_id: courseId,
                    url: resourceId,
                },
            ])

            if (error) {
                console.error("Error creating resource:", error)
            }
        }

        // Record resource interaction
        await supabase.from("resource_interactions").insert([
            {
                resource_id: resourceId,
                user_id: null, // Will be updated if user is known
                interaction_type: "access",
                timestamp: new Date().toISOString(),
            },
        ])
    }

    // Ensure quiz exists in the database
    private async ensureQuizExists(quizId: string, title: string, courseId?: string): Promise<void> {
        // Check if quiz exists
        const { data: existingQuiz } = await supabase.from("quizzes").select("quiz_id").eq("quiz_id", quizId).single()

        if (!existingQuiz) {
            // Create new quiz
            const { error } = await supabase.from("quizzes").insert([
                {
                    quiz_id: quizId,
                    title: title || quizId,
                    course_id: courseId,
                    description: "",
                },
            ])

            if (error) {
                console.error("Error creating quiz:", error)
            }
        }
    }

    // Create multiple events in batch
    async createBatchEvents(events: TrackingEvent[]): Promise<any> {
        // Process each event to ensure related entities exist
        for (const event of events) {
            if (event.userId) {
                await this.ensureUserExists(event.userId)
            }

            if (event.sessionId) {
                await this.ensureSessionExists(event.sessionId, event.userId, event.deviceInfo, event.browserInfo)
            }

            if (event.eventType === "resource_access" && event.details?.resourceId) {
                await this.ensureResourceExists(
                    event.details.resourceId,
                    event.details.resourceTitle,
                    event.details.resourceType,
                    event.details.courseId,
                )
            }

            if (event.eventType === "quiz_attempt" && event.details?.quizId) {
                await this.ensureQuizExists(event.details.quizId, event.details.quizTitle, event.details.courseId)
            }
        }

        const formattedEvents = events.map((event) => ({
            event_type: event.eventType,
            user_id: event.userId,
            url: event.url,
            path: event.path,
            details: event.details,
            timestamp: event.timestamp,
            session_id: event.sessionId,
            device_info: event.deviceInfo,
            browser_info: event.browserInfo,
            ip_address: event.ipAddress,
            referrer: event.referrer,
            duration: event.duration,
        }))

        const { data, error } = await supabase.from("events").insert(formattedEvents).select()

        if (error) {
            console.error("Error creating batch events:", error)
            throw error
        }

        return data
    }

    // Get events with pagination and filtering
    async getEvents(page: number, limit: number, filters: any): Promise<{ events: any[]; total: number }> {
        let query = supabase.from("events").select("*", { count: "exact" })

        // Apply filters
        if (filters.startDate) {
            query = query.gte("timestamp", filters.startDate.toISOString())
        }

        if (filters.endDate) {
            query = query.lte("timestamp", filters.endDate.toISOString())
        }

        if (filters.eventType) {
            query = query.eq("event_type", filters.eventType)
        }

        if (filters.userId) {
            query = query.eq("user_id", filters.userId)
        }

        if (filters.sessionId) {
            query = query.eq("session_id", filters.sessionId)
        }

        if (filters.path) {
            query = query.ilike("path", `%${filters.path}%`)
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to).order("timestamp", { ascending: false })

        const { data, error, count } = await query

        if (error) {
            console.error("Error getting events:", error)
            throw error
        }

        return {
            events: data || [],
            total: count || 0,
        }
    }

    // Get events by user ID
    async getEventsByUser(userId: string, page: number, limit: number): Promise<{ events: any[]; total: number }> {
        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, error, count } = await supabase
            .from("events")
            .select("*", { count: "exact" })
            .eq("user_id", userId)
            .range(from, to)
            .order("timestamp", { ascending: false })

        if (error) {
            console.error("Error getting events by user:", error)
            throw error
        }

        return {
            events: data || [],
            total: count || 0,
        }
    }

    // Get events by type
    async getEventsByType(eventType: string, page: number, limit: number): Promise<{ events: any[]; total: number }> {
        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, error, count } = await supabase
            .from("events")
            .select("*", { count: "exact" })
            .eq("event_type", eventType)
            .range(from, to)
            .order("timestamp", { ascending: false })

        if (error) {
            console.error("Error getting events by type:", error)
            throw error
        }

        return {
            events: data || [],
            total: count || 0,
        }
    }

    // Get event count by type
    async getEventCountByType(eventType: string, startDate?: Date, endDate?: Date): Promise<number> {
        let query = supabase.from("events").select("*", { count: "exact" })

        if (eventType) {
            query = query.eq("event_type", eventType)
        }

        if (startDate) {
            query = query.gte("timestamp", startDate.toISOString())
        }

        if (endDate) {
            query = query.lte("timestamp", endDate.toISOString())
        }

        const { count, error } = await query

        if (error) {
            console.error("Error getting event count by type:", error)
            throw error
        }

        return count || 0
    }

    // Get events by date range
    async getEventsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .gte("timestamp", startDate.toISOString())
            .lte("timestamp", endDate.toISOString())
            .order("timestamp", { ascending: true })

        if (error) {
            console.error("Error getting events by date range:", error)
            throw error
        }

        return data || []
    }
}

