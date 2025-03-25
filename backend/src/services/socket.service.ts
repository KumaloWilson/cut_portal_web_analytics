import { Server as SocketIOServer } from "socket.io"
import type { Server as HttpServer } from "http"
import type { Event } from "../models/event.model"
import type { Session } from "../models/session.model"
import type { Student } from "../models/student.model"

let io: SocketIOServer | null = null

export class WebSocketService {
  static initialize(server: HttpServer): void {
    io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      // Join rooms for specific data
      socket.on("join", (rooms: string[]) => {
        if (Array.isArray(rooms)) {
          rooms.forEach((room) => {
            socket.join(room)
            console.log(`Socket ${socket.id} joined room: ${room}`)
          })
        }
      })

      // Leave rooms
      socket.on("leave", (rooms: string[]) => {
        if (Array.isArray(rooms)) {
          rooms.forEach((room) => {
            socket.leave(room)
            console.log(`Socket ${socket.id} left room: ${room}`)
          })
        }
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })

    console.log("WebSocket server initialized")
  }

  static broadcastEvent(event: Event): void {
    if (!io) return

    // Broadcast to general events room
    io.to("events").emit("new-event", event)

    // Broadcast to specific student room if available
    if (event.student_id) {
      io.to(`student:${event.student_id}`).emit("new-event", event)
    }

    // Broadcast to specific session room
    io.to(`session:${event.session_id}`).emit("new-event", event)
  }

  static broadcastSessionUpdate(session: Session): void {
    if (!io) return

    // Broadcast to general sessions room
    io.to("sessions").emit("session-update", session)

    // Broadcast to specific student room if available
    if (session.student_id) {
      io.to(`student:${session.student_id}`).emit("session-update", session)
    }

    // Broadcast to specific session room
    io.to(`session:${session.session_id}`).emit("session-update", session)
  }

  static broadcastStudentUpdate(student: Student): void {
    if (!io) return

    // Broadcast to general students room
    io.to("students").emit("student-update", student)

    // Broadcast to specific student room
    io.to(`student:${student.student_id}`).emit("student-update", student)
  }

  static broadcastAnalyticsUpdate(type: string, data: any): void {
    if (!io) return
    io.to("analytics").emit(`analytics-update:${type}`, data)
  }
}

