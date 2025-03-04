
import { supabase } from "../configs/supabase"
import type { TrackingEvent } from "../types/events"

export class EventService {
    // Create a single event
    async createEvent(event: TrackingEvent): Promise<any> {
        const { data, error } = await supabase
            .from("events")
            .insert([
                {
                    event_type: event.eventType,
                    url: event.url,
                    path: event.path,
                    details: event.details,
                    timestamp: event.timestamp,
                    user_id: event.userId,
                },
            ])
            .select()

        if (error) {
            console.error("Error creating event:", error)
            throw error
        }

        return data
    }

    // Create multiple events in batch
    async createBatchEvents(events: TrackingEvent[]): Promise<any> {
        const formattedEvents = events.map((event) => ({
            event_type: event.eventType,
            url: event.url,
            path: event.path,
            details: event.details,
            timestamp: event.timestamp,
            user_id: event.userId,
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
        let query = supabase.from("events").select("*", { count: "exact" }).eq("event_type", eventType)

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

