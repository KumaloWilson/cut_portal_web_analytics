import axios from "axios"

// Create axios instance
const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
})

// Format date for API requests
const formatDateParam = (date: Date): string => {
    return date.toISOString()
}

// Fetch dashboard data
export const fetchDashboardData = async (startDate: Date, endDate: Date): Promise<any> => {
    const response = await api.get("/analytics/dashboard", {
        params: {
            startDate: formatDateParam(startDate),
            endDate: formatDateParam(endDate),
        },
    })

    return response.data
}

// Fetch events with pagination and filtering
export const fetchEvents = async (
    page: number,
    limit: number,
    filters: {
        startDate: Date
        endDate: Date
        eventType?: string
        userId?: string
    },
): Promise<any> => {
    const params: any = {
        page,
        limit,
        startDate: formatDateParam(filters.startDate),
        endDate: formatDateParam(filters.endDate),
    }

    if (filters.eventType) {
        params.eventType = filters.eventType
    }

    if (filters.userId) {
        params.userId = filters.userId
    }

    const response = await api.get("/events", { params })
    return response.data
}

// Fetch events by user
export const fetchEventsByUser = async (userId: string, page: number, limit: number): Promise<any> => {
    const response = await api.get(`/events/user/${userId}`, {
        params: { page, limit },
    })

    return response.data
}

// Fetch events by type
export const fetchEventsByType = async (eventType: string, page: number, limit: number): Promise<any> => {
    const response = await api.get(`/events/type/${eventType}`, {
        params: { page, limit },
    })

    return response.data
}

// Fetch user stats
export const fetchUserStats = async (userId?: string): Promise<any> => {
    const url = userId ? `/stats/user/${userId}` : "/stats/user"
    const response = await api.get(url)

    return response.data
}

// Fetch overall stats
export const fetchOverallStats = async (): Promise<any> => {
    const response = await api.get("/stats")

    return response.data
}

// Fetch daily stats
export const fetchDailyStats = async (date?: Date): Promise<any> => {
    const params: any = {}

    if (date) {
        params.date = formatDateParam(date)
    }

    const response = await api.get("/stats/daily", { params })

    return response.data
}

// Fetch weekly stats
export const fetchWeeklyStats = async (startDate?: Date): Promise<any> => {
    const params: any = {}

    if (startDate) {
        params.startDate = formatDateParam(startDate)
    }

    const response = await api.get("/stats/weekly", { params })

    return response.data
}

// Fetch monthly stats
export const fetchMonthlyStats = async (year?: number, month?: number): Promise<any> => {
    const params: any = {}

    if (year) {
        params.year = year
    }

    if (month) {
        params.month = month
    }

    const response = await api.get("/stats/monthly", { params })

    return response.data
}

