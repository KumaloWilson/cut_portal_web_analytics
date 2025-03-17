import { query } from "../configs/postgres"
import { EventType } from "../types/events"

export class AnalyticsService {
  // Get page view analytics
  async getPageViewAnalytics(filters: any): Promise<any> {
    const { startDate, endDate } = filters
    const queryParams: any[] = []
    let whereClause = ""
    let paramIndex = 1

    if (startDate || endDate) {
      whereClause = "WHERE "

      if (startDate) {
        whereClause += `timestamp >= $${paramIndex++}`
        queryParams.push(startDate)
      }

      if (endDate) {
        if (startDate) whereClause += " AND "
        whereClause += `timestamp <= $${paramIndex++}`
        queryParams.push(endDate)
      }
    }

    // Get all page view events in the date range
    const eventsQuery = `
      SELECT * FROM events 
      ${whereClause}
      AND event_type = $${paramIndex}
    `
    queryParams.push(EventType.PAGE_VIEW)

    const eventsResult = await query(eventsQuery, queryParams)
    const events = eventsResult.rows

    // Group page views by path
    const pageViewsByPath: Record<string, number> = {}

    events.forEach((event: { path: any }) => {
      const path = event.path
      pageViewsByPath[path] = (pageViewsByPath[path] || 0) + 1
    })

    // Convert to array and sort by count
    const pageViewsArray = Object.entries(pageViewsByPath).map(([path, count]) => ({
      path,
      count,
    }))

    pageViewsArray.sort((a, b) => b.count - a.count)

    return {
      totalPageViews: events.length,
      pageViewsByPath: pageViewsArray,
    }
  }

  // Get user engagement analytics
  async getUserEngagementAnalytics(filters: any): Promise<any> {
    const { startDate, endDate, userId } = filters
    const queryParams: any[] = []
    let whereClause = ""
    let paramIndex = 1

    if (startDate || endDate || userId) {
      whereClause = "WHERE "

      if (startDate) {
        whereClause += `timestamp >= $${paramIndex++}`
        queryParams.push(startDate)
      }

      if (endDate) {
        if (startDate) whereClause += " AND "
        whereClause += `timestamp <= $${paramIndex++}`
        queryParams.push(endDate)
      }

      if (userId) {
        if (startDate || endDate) whereClause += " AND "
        whereClause += `user_id = $${paramIndex++}`
        queryParams.push(userId)
      }
    }

    if (userId) {
      // Get events for specific user
      const eventsQuery = `
        SELECT * FROM events 
        ${whereClause}
      `

      const eventsResult = await query(eventsQuery, queryParams)
      const events = eventsResult.rows

      // Calculate engagement metrics
      const eventCounts: Record<string, number> = {}

      events.forEach((event: { event_type: any }) => {
        const eventType = event.event_type
        eventCounts[eventType] = (eventCounts[eventType] || 0) + 1
      })

      return {
        totalEvents: events.length,
        eventCounts,
        userId,
      }
    } else {
      // Get all users and their event counts
      const eventsQuery = `
        SELECT * FROM events 
        ${whereClause}
      `

      const eventsResult = await query(eventsQuery, queryParams)
      const events = eventsResult.rows

      // Group by user
      const userEngagement: Record<string, any> = {}

      events.forEach((event: { user_id: any; event_type: any }) => {
        const userId = event.user_id
        if (!userId) return

        if (!userEngagement[userId]) {
          userEngagement[userId] = {
            totalEvents: 0,
            eventCounts: {},
          }
        }

        userEngagement[userId].totalEvents += 1

        const eventType = event.event_type
        userEngagement[userId].eventCounts[eventType] = (userEngagement[userId].eventCounts[eventType] || 0) + 1
      })

      // Convert to array and sort by total events
      const userEngagementArray = Object.entries(userEngagement).map(([userId, data]) => ({
        userId,
        ...data,
      }))

      userEngagementArray.sort((a, b) => b.totalEvents - a.totalEvents)

      return {
        totalUsers: userEngagementArray.length,
        userEngagement: userEngagementArray,
      }
    }
  }

  // Get resource access analytics
  async getResourceAccessAnalytics(filters: any): Promise<any> {
    const { startDate, endDate } = filters
    const queryParams: any[] = []
    let whereClause = ""
    let paramIndex = 1

    if (startDate || endDate) {
      whereClause = "WHERE "

      if (startDate) {
        whereClause += `timestamp >= $${paramIndex++}`
        queryParams.push(startDate)
      }

      if (endDate) {
        if (startDate) whereClause += " AND "
        whereClause += `timestamp <= $${paramIndex++}`
        queryParams.push(endDate)
      }
    }

    // Add event type filter
    if (whereClause) {
      whereClause += " AND "
    } else {
      whereClause = "WHERE "
    }
    whereClause += `event_type = $${paramIndex++}`
    queryParams.push(EventType.RESOURCE_ACCESS)

    // Get all resource access events in the date range
    const eventsQuery = `
      SELECT * FROM events 
      ${whereClause}
    `

    const eventsResult = await query(eventsQuery, queryParams)
    const events = eventsResult.rows

    // Group resource accesses by resource
    const resourceAccessesByResource: Record<string, number> = {}

    events.forEach((event: { details: { resourceId: string } }) => {
      const resourceId = event.details?.resourceId || "unknown"
      resourceAccessesByResource[resourceId] = (resourceAccessesByResource[resourceId] || 0) + 1
    })

    // Convert to array and sort by count
    const resourceAccessesArray = Object.entries(resourceAccessesByResource).map(([resourceId, count]) => ({
      resourceId,
      count,
    }))

    resourceAccessesArray.sort((a, b) => b.count - a.count)

    return {
      totalResourceAccesses: events.length,
      resourceAccessesByResource: resourceAccessesArray,
    }
  }

  // Get time spent analytics
  async getTimeSpentAnalytics(filters: any): Promise<any> {
    const { startDate, endDate, userId } = filters
    const queryParams: any[] = []
    let whereClause = ""
    let paramIndex = 1

    if (startDate || endDate || userId) {
      whereClause = "WHERE "

      if (startDate) {
        whereClause += `timestamp >= $${paramIndex++}`
        queryParams.push(startDate)
      }

      if (endDate) {
        if (startDate) whereClause += " AND "
        whereClause += `timestamp <= $${paramIndex++}`
        queryParams.push(endDate)
      }

      if (userId) {
        if (startDate || endDate) whereClause += " AND "
        whereClause += `user_id = $${paramIndex++}`
        queryParams.push(userId)
      }
    }

    // Add event type filter
    if (whereClause) {
      whereClause += " AND "
    } else {
      whereClause = "WHERE "
    }
    whereClause += `event_type = $${paramIndex++}`
    queryParams.push(EventType.PAGE_EXIT)

    // Get all page exit events in the date range
    const eventsQuery = `
      SELECT * FROM events 
      ${whereClause}
    `

    const eventsResult = await query(eventsQuery, queryParams)
    const events = eventsResult.rows

    // Calculate time spent by path
    const timeSpentByPath: Record<string, number> = {}
    let totalTimeSpent = 0

    events.forEach((event: { path: any; details: { timeSpent: number } }) => {
      const path = event.path
      const timeSpent = event.details?.timeSpent || 0

      timeSpentByPath[path] = (timeSpentByPath[path] || 0) + timeSpent
      totalTimeSpent += timeSpent
    })

    // Convert to array and sort by time spent
    const timeSpentArray = Object.entries(timeSpentByPath).map(([path, timeSpent]) => ({
      path,
      timeSpent,
      timeSpentMinutes: Math.round((timeSpent / 60000) * 10) / 10, // Convert to minutes with 1 decimal
    }))

    timeSpentArray.sort((a, b) => b.timeSpent - a.timeSpent)

    return {
      totalTimeSpent,
      totalTimeSpentMinutes: Math.round((totalTimeSpent / 60000) * 10) / 10,
      timeSpentByPath: timeSpentArray,
    }
  }

  // Get event frequency analytics
  async getEventFrequencyAnalytics(filters: any): Promise<any> {
    const { startDate, endDate, interval = "day" } = filters
    const queryParams: any[] = []
    let whereClause = ""
    let paramIndex = 1

    if (startDate || endDate) {
      whereClause = "WHERE "

      if (startDate) {
        whereClause += `timestamp >= $${paramIndex++}`
        queryParams.push(startDate)
      }

      if (endDate) {
        if (startDate) whereClause += " AND "
        whereClause += `timestamp <= $${paramIndex++}`
        queryParams.push(endDate)
      }
    }

    // Get all events in the date range
    const eventsQuery = `
      SELECT * FROM events 
      ${whereClause}
    `

    const eventsResult = await query(eventsQuery, queryParams)
    const events = eventsResult.rows

    // Group events by interval
    const eventsByInterval: Record<string, number> = {}

    events.forEach((event: { timestamp: string | number | Date }) => {
      const date = new Date(event.timestamp)
      let intervalKey

      switch (interval) {
        case "hour":
          intervalKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`
          break
        case "day":
          intervalKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          break
        case "week":
          // Get the first day of the week (Sunday)
          const firstDayOfWeek = new Date(date)
          const day = date.getDay()
          firstDayOfWeek.setDate(date.getDate() - day)
          intervalKey = `Week of ${firstDayOfWeek.getFullYear()}-${firstDayOfWeek.getMonth() + 1}-${firstDayOfWeek.getDate()}`
          break
        case "month":
          intervalKey = `${date.getFullYear()}-${date.getMonth() + 1}`
          break
        default:
          intervalKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      }

      eventsByInterval[intervalKey] = (eventsByInterval[intervalKey] || 0) + 1
    })

    // Convert to array and sort by interval
    const eventFrequencyArray = Object.entries(eventsByInterval).map(([interval, count]) => ({
      interval,
      count,
    }))

    eventFrequencyArray.sort((a, b) => a.interval.localeCompare(b.interval))

    return {
      totalEvents: events.length,
      eventFrequency: eventFrequencyArray,
    }
  }

  // Get dashboard data (combined analytics)
  async getDashboardData(filters: any): Promise<any> {
    const [pageViewAnalytics, userEngagementAnalytics, timeSpentAnalytics, eventFrequencyAnalytics] = await Promise.all(
      [
        this.getPageViewAnalytics(filters),
        this.getUserEngagementAnalytics(filters),
        this.getTimeSpentAnalytics(filters),
        this.getEventFrequencyAnalytics({ ...filters, interval: "day" }),
      ],
    )

    return {
      pageViews: pageViewAnalytics,
      userEngagement: userEngagementAnalytics,
      timeSpent: timeSpentAnalytics,
      eventFrequency: eventFrequencyAnalytics,
    }
  }
}

