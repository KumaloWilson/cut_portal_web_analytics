import { EventService } from "./eventService"
import { EventType } from "../types/events"

export class StatsService {
    private readonly eventService: EventService

    constructor() {
        this.eventService = new EventService()
    }

    // Get overall stats
    async getOverallStats(): Promise<any> {
        // Get total events
        const { total: totalEvents } = await this.eventService.getEvents(1, 1, {})

        // Get total page views
        const pageViews = await this.eventService.getEventCountByType(EventType.PAGE_VIEW)

        // Get total button clicks
        const buttonClicks = await this.eventService.getEventCountByType(EventType.BUTTON_CLICK)

        // Get total form submissions
        const formSubmits = await this.eventService.getEventCountByType(EventType.FORM_SUBMIT)

        // Get today's events
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayEvents = await this.eventService.getEventCountByType("", today)

        return {
            totalEvents,
            pageViews,
            buttonClicks,
            formSubmits,
            todayEvents,
        }
    }

    // Get user stats
    async getUserStats(userId?: string): Promise<any> {
        if (userId) {
            // Get total events for user
            const { total: totalEvents } = await this.eventService.getEventsByUser(userId, 1, 1)

            // Get today's events for user
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { events: todayEventsData } = await this.eventService.getEventsByUser(userId, 1, 1000)
            const todayEvents = todayEventsData.filter((event) => new Date(event.timestamp) >= today).length

            return {
                userId,
                totalEvents,
                todayEvents,
            }
        } else {
            // Return default stats for extension popup
            return {
                totalEvents: 0,
                todayEvents: 0,
            }
        }
    }

    // Get daily stats
    async getDailyStats(date: Date): Promise<any> {
        // Set time to start of day
        const startDate = new Date(date)
        startDate.setHours(0, 0, 0, 0)

        // Set time to end of day
        const endDate = new Date(date)
        endDate.setHours(23, 59, 59, 999)

        // Get events for the day
        const events = await this.eventService.getEventsByDateRange(startDate, endDate)

        // Count events by type
        const eventCounts: Record<string, number> = {}

        events.forEach((event) => {
            const eventType = event.event_type
            eventCounts[eventType] = (eventCounts[eventType] || 0) + 1
        })

        // Count events by hour
        const eventsByHour: Record<number, number> = {}

        for (let i = 0; i < 24; i++) {
            eventsByHour[i] = 0
        }

        events.forEach((event) => {
            const hour = new Date(event.timestamp).getHours()
            eventsByHour[hour] = (eventsByHour[hour] || 0) + 1
        })

        return {
            date: startDate.toISOString().split("T")[0],
            totalEvents: events.length,
            eventCounts,
            eventsByHour,
        }
    }

    // Get weekly stats
    async getWeeklyStats(weekStart: Date): Promise<any> {
        // Adjust to start of week (Sunday)
        const startDate = new Date(weekStart)
        const day = startDate.getDay()
        startDate.setDate(startDate.getDate() - day)
        startDate.setHours(0, 0, 0, 0)

        // Set end date to end of week (Saturday)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)

        // Get events for the week
        const events = await this.eventService.getEventsByDateRange(startDate, endDate)

        // Count events by day of week
        const eventsByDay: Record<number, number> = {}

        for (let i = 0; i < 7; i++) {
            eventsByDay[i] = 0
        }

        events.forEach((event) => {
            const day = new Date(event.timestamp).getDay()
            eventsByDay[day] = (eventsByDay[day] || 0) + 1
        })

        // Count events by type
        const eventCounts: Record<string, number> = {}

        events.forEach((event) => {
            const eventType = event.event_type
            eventCounts[eventType] = (eventCounts[eventType] || 0) + 1
        })

        return {
            weekStart: startDate.toISOString().split("T")[0],
            weekEnd: endDate.toISOString().split("T")[0],
            totalEvents: events.length,
            eventCounts,
            eventsByDay,
        }
    }

    // Get monthly stats
    async getMonthlyStats(year: number, month: number): Promise<any> {
        // Set start date to first day of month
        const startDate = new Date(year, month, 1)
        startDate.setHours(0, 0, 0, 0)

        // Set end date to last day of month
        const endDate = new Date(year, month + 1, 0)
        endDate.setHours(23, 59, 59, 999)

        // Get events for the month
        const events = await this.eventService.getEventsByDateRange(startDate, endDate)

        // Count events by day of month
        const eventsByDay: Record<number, number> = {}

        // Initialize all days of the month
        const daysInMonth = endDate.getDate()
        for (let i = 1; i <= daysInMonth; i++) {
            eventsByDay[i] = 0
        }

        events.forEach((event) => {
            const day = new Date(event.timestamp).getDate()
            eventsByDay[day] = (eventsByDay[day] || 0) + 1
        })

        // Count events by type
        const eventCounts: Record<string, number> = {}

        events.forEach((event) => {
            const eventType = event.event_type
            eventCounts[eventType] = (eventCounts[eventType] || 0) + 1
        })

        return {
            year,
            month: month + 1,
            totalEvents: events.length,
            eventCounts,
            eventsByDay,
        }
    }
}

