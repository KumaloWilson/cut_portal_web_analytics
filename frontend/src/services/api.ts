// import axios from "axios"


// // Create axios instance
// const api = axios.create({
//   baseURL: "http://localhost:3000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Format date for API requests
// const formatDateParam = (date: Date): string => {
//   return date.toISOString()
// }

// // Fetch dashboard data
// export const fetchDashboardData = async (startDate: Date, endDate: Date): Promise<any> => {
//   const response = await api.get("/analytics/dashboard", {
//     params: {
//       startDate: formatDateParam(startDate),
//       endDate: formatDateParam(endDate),
//     },
//   })

//   return response.data
// }

// // Fetch events with pagination and filtering
// export const fetchEvents = async (
//   page: number,
//   limit: number,
//   filters: {
//     startDate: Date
//     endDate: Date
//     eventType?: string
//     userId?: string
//     search?: string
//     sort?: string
//     direction?: string
//   },
// ): Promise<any> => {
//   const params: any = {
//     page,
//     limit,
//     startDate: formatDateParam(filters.startDate),
//     endDate: formatDateParam(filters.endDate),
//   }

//   if (filters.eventType) {
//     params.eventType = filters.eventType
//   }

//   if (filters.userId) {
//     params.userId = filters.userId
//   }

//   if (filters.search) {
//     params.search = filters.search
//   }

//   if (filters.sort) {
//     params.sort = filters.sort
//     params.direction = filters.direction || "asc"
//   }

//   const response = await api.get("/events", { params })
//   return response.data
// }

// // Fetch events by user
// export const fetchEventsByUser = async (userId: string, page: number, limit: number): Promise<any> => {
//   const response = await api.get(`/events/user/${userId}`, {
//     params: { page, limit },
//   })

//   return response.data
// }

// // Fetch events by type
// export const fetchEventsByType = async (eventType: string, page: number, limit: number): Promise<any> => {
//   const response = await api.get(`/events/type/${eventType}`, {
//     params: { page, limit },
//   })

//   return response.data
// }

// // Fetch user stats
// export const fetchUserStats = async (userId?: string): Promise<any> => {
//   const url = userId ? `/stats/user/${userId}` : "/stats/user"
//   const response = await api.get(url)

//   return response.data
// }

// // Fetch overall stats
// export const fetchOverallStats = async (): Promise<any> => {
//   const response = await api.get("/stats")

//   return response.data
// }

// // Fetch daily stats
// export const fetchDailyStats = async (date?: Date): Promise<any> => {
//   const params: any = {}

//   if (date) {
//     params.date = formatDateParam(date)
//   }

//   const response = await api.get("/stats/daily", { params })

//   return response.data
// }

// // Fetch weekly stats
// export const fetchWeeklyStats = async (startDate?: Date): Promise<any> => {
//   const params: any = {}

//   if (startDate) {
//     params.startDate = formatDateParam(startDate)
//   }

//   const response = await api.get("/stats/weekly", { params })

//   return response.data
// }

// // Fetch monthly stats
// export const fetchMonthlyStats = async (year?: number, month?: number): Promise<any> => {
//   const params: any = {}

//   if (year) {
//     params.year = year
//   }

//   if (month) {
//     params.month = month
//   }

//   const response = await api.get("/stats/monthly", { params })

//   return response.data
// }

// // Fetch students with pagination and filtering
// export const fetchStudents = async (
//   page: number,
//   limit: number,
//   filters: {
//     facultyCode?: string
//     programCode?: string
//     level?: string
//     search?: string
//     sort?: string
//     direction?: string
//   },
// ): Promise<any> => {
//   const params: any = {
//     page,
//     limit,
//   }

//   if (filters.facultyCode) {
//     params.facultyCode = filters.facultyCode
//   }

//   if (filters.programCode) {
//     params.programCode = filters.programCode
//   }

//   if (filters.level) {
//     params.level = filters.level
//   }

//   if (filters.search) {
//     params.search = filters.search
//   }

//   if (filters.sort) {
//     params.sort = filters.sort
//     params.direction = filters.direction || "asc"
//   }

//   const response = await api.get("/students", { params })
//   return response.data
// }

// // Fetch student by ID
// export const fetchStudentById = async (studentId: string): Promise<any> => {
//   const response = await api.get(`/students/${studentId}`)
//   return response.data
// }

// // Fetch student activity
// export const fetchStudentActivity = async (studentId: string, days: number): Promise<any> => {
//   const response = await api.get(`/students/${studentId}/activity`, {
//     params: { days },
//   })
//   return response.data
// }

// // Fetch student modules
// export const fetchStudentModules = async (studentId: string): Promise<any> => {
//   const response = await api.get(`/students/${studentId}/modules`)
//   return response.data
// }

// // Fetch student faculty stats
// export const fetchStudentFacultyStats = async (studentId: string): Promise<any> => {
//   const response = await api.get(`/students/${studentId}/faculty-stats`)
//   return response.data
// }

// // Fetch student program stats
// export const fetchStudentProgramStats = async (studentId: string): Promise<any> => {
//   const response = await api.get(`/students/${studentId}/program-stats`)
//   return response.data
// }

// // Fetch faculty stats
// export const fetchFacultyStats = async (): Promise<any> => {
//   const response = await api.get("/faculties/stats")
//   return response.data
// }

// // Fetch program stats
// export const fetchProgramStats = async (): Promise<any> => {
//   const response = await api.get("/programs/stats")
//   return response.data
// }

// // Fetch modules with pagination and filtering
// export const fetchModules = async (
//   page: number,
//   limit: number,
//   filters: {
//     facultyCode?: string
//     programCode?: string
//     search?: string
//     sort?: string
//     direction?: string
//   },
// ): Promise<any> => {
//   const params: any = {
//     page,
//     limit,
//   }

//   if (filters.facultyCode) {
//     params.facultyCode = filters.facultyCode
//   }

//   if (filters.programCode) {
//     params.programCode = filters.programCode
//   }

//   if (filters.search) {
//     params.search = filters.search
//   }

//   if (filters.sort) {
//     params.sort = filters.sort
//     params.direction = filters.direction || "asc"
//   }

//   const response = await api.get("/modules", { params })
//   return response.data
// }

// // Fetch module by ID
// export const fetchModuleById = async (moduleId: string): Promise<any> => {
//   const response = await api.get(`/modules/${moduleId}`)
//   return response.data
// }

// // Fetch module activity
// export const fetchModuleActivity = async (moduleId: string, days: number): Promise<any> => {
//   const response = await api.get(`/modules/${moduleId}/activity`, {
//     params: { days },
//   })
//   return response.data
// }

// // Fetch module students
// export const fetchModuleStudents = async (
//   moduleId: string,
//   page: number,
//   limit: number,
//   filters: {
//     role?: string
//     search?: string
//   },
// ): Promise<any> => {
//   const params: any = {
//     page,
//     limit,
//   }

//   if (filters.role) {
//     params.role = filters.role
//   }

//   if (filters.search) {
//     params.search = filters.search
//   }

//   const response = await api.get(`/modules/${moduleId}/students`, { params })
//   return response.data
// }

// // Fetch module resources
// export const fetchModuleResources = async (moduleId: string): Promise<any> => {
//   const response = await api.get(`/modules/${moduleId}/resources`)
//   return response.data
// }

// // Fetch module past exam papers
// export const fetchModulePastExamPapers = async (moduleId: string): Promise<any> => {
//   const response = await api.get(`/modules/${moduleId}/past-exam-papers`)
//   return response.data
// }


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
    search?: string
    sort?: string
    direction?: "asc" | "desc"
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

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.sort) {
    params.sort = filters.sort
    params.direction = filters.direction || "asc"
  }

  const response = await api.get("/events", { params })
  return response.data
}

// Fetch students with pagination and filtering
export const fetchStudents = async (
  page: number,
  limit: number,
  filters: {
    facultyCode?: string
    programCode?: string
    level?: string
    search?: string
    sort?: string
    direction?: "asc" | "desc"
  },
): Promise<any> => {
  const params: any = {
    page,
    limit,
  }

  if (filters.facultyCode) {
    params.facultyCode = filters.facultyCode
  }

  if (filters.programCode) {
    params.programCode = filters.programCode
  }

  if (filters.level) {
    params.level = filters.level
  }

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.sort) {
    params.sort = filters.sort
    params.direction = filters.direction || "asc"
  }

  const response = await api.get("/students", { params })
  return response.data
}

// Fetch student by ID
export const fetchStudentById = async (studentId: string): Promise<any> => {
  const response = await api.get(`/students/${studentId}`)
  return response.data
}

// Fetch student activity
export const fetchStudentActivity = async (studentId: string, days: number): Promise<any> => {
  const response = await api.get(`/students/${studentId}/activity`, {
    params: { days },
  })
  return response.data
}

// Fetch student modules
export const fetchStudentModules = async (studentId: string): Promise<any> => {
  const response = await api.get(`/students/${studentId}/modules`)
  return response.data
}

// Fetch student faculty stats
export const fetchStudentFacultyStats = async (studentId: string): Promise<any> => {
  const response = await api.get(`/students/${studentId}/faculty-stats`)
  return response.data
}

// Fetch student program stats
export const fetchStudentProgramStats = async (studentId: string): Promise<any> => {
  const response = await api.get(`/students/${studentId}/program-stats`)
  return response.data
}

// Fetch modules with pagination and filtering
export const fetchModules = async (
  page: number,
  limit: number,
  filters: {
    facultyCode?: string
    programCode?: string
    search?: string
    sort?: string
    direction?: "asc" | "desc"
  },
): Promise<any> => {
  const params: any = {
    page,
    limit,
  }

  if (filters.facultyCode) {
    params.facultyCode = filters.facultyCode
  }

  if (filters.programCode) {
    params.programCode = filters.programCode
  }

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.sort) {
    params.sort = filters.sort
    params.direction = filters.direction || "asc"
  }

  const response = await api.get("/modules", { params })
  return response.data
}

// Fetch module by ID
export const fetchModuleById = async (moduleId: string): Promise<any> => {
  const response = await api.get(`/modules/${moduleId}`)
  return response.data
}

// Fetch module activity
export const fetchModuleActivity = async (moduleId: string, days: number): Promise<any> => {
  const response = await api.get(`/modules/${moduleId}/activity`, {
    params: { days },
  })
  return response.data
}

// Fetch faculty stats
export const fetchFacultyStats = async (): Promise<any> => {
  const response = await api.get("/analytics/faculty-stats")
  return response.data
}

// Fetch program stats
export const fetchProgramStats = async (): Promise<any> => {
  const response = await api.get("/analytics/program-stats")
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

// Fetch resources with filtering
export const fetchResources = async (filters: {
  moduleId?: string
  userId?: string
  type?: string
  search?: string
  sort?: string
  direction?: "asc" | "desc"
  limit?: number
  page?: number
}): Promise<any> => {
  const params: any = {}

  if (filters.moduleId) {
    params.moduleId = filters.moduleId
  }

  if (filters.userId) {
    params.userId = filters.userId
  }

  if (filters.type) {
    params.type = filters.type
  }

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.sort) {
    params.sort = filters.sort
    params.direction = filters.direction || "asc"
  }

  if (filters.limit) {
    params.limit = filters.limit
  }

  if (filters.page) {
    params.page = filters.page
  }

  const response = await api.get("/resources", { params })
  return response.data
}

// Fetch resource by ID
export const fetchResourceById = async (resourceId: string): Promise<any> => {
  const response = await api.get(`/resources/${resourceId}`)
  return response.data
}

// Fetch resource access stats
export const fetchResourceAccessStats = async (resourceId: string, days: number): Promise<any> => {
  const response = await api.get(`/resources/${resourceId}/access-stats`, {
    params: { days },
  })
  return response.data
}

// Fetch student engagement comparison data
export const fetchStudentEngagementComparison = async (studentId: string, moduleId?: string): Promise<any> => {
  const params: any = {}

  if (moduleId) {
    params.moduleId = moduleId
  }

  const response = await api.get(`/students/${studentId}/engagement-comparison`, { params })
  return response.data
}

// Fetch student progress data
export const fetchStudentProgress = async (studentId: string, moduleId?: string): Promise<any> => {
  const params: any = {}

  if (moduleId) {
    params.moduleId = moduleId
  }

  const response = await api.get(`/students/${studentId}/progress`, { params })
  return response.data
}

// Fetch module progress data
export const fetchModuleProgress = async (moduleId: string): Promise<any> => {
  const response = await api.get(`/modules/${moduleId}/progress`)
  return response.data
}

// Export data to various formats
export const exportData = async (endpoint: string, format: "excel" | "csv" | "pdf", params: any): Promise<Blob> => {
  const response = await api.get(`/export/${endpoint}`, {
    params: {
      ...params,
      format,
    },
    responseType: "blob",
  })

  return response.data
}

