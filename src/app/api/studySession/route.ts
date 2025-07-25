import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@script/db"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

// Constants
const ALL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const
type Day = (typeof ALL_DAYS)[number]

// Database Types
interface TimetableRow extends RowDataPacket {
  tt_id: number
  user_id: number
  day: Day
  time: string
  task_name: string
  color: string
}

// Request/Response Types
type TimetableEvent = {
  id: number
  day: Day
  time: string
  event: string
  color: string
}

type ErrorResponse = {
  error: string
  message?: string
}

// Helper Functions
const validateUserId = (userId: string | undefined): userId is string => {
  return !!userId
}

const validateEventData = (data: any): data is { day: Day; time: string; task_name: string; color: string } => {
  return (
    data &&
    typeof data.day === 'string' && 
    typeof data.time === 'string' &&
    typeof data.task_name === 'string' &&
    typeof data.color === 'string' &&
    ALL_DAYS.includes(data.day as Day)
  )
}

const validateEventId = (data: any): data is { id: number } => {
  return data && typeof data.id === 'number'
}

// Main Route Handlers
export async function POST(req: Request) {
  try {
    // Authentication check
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!validateUserId(userId)) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized - Please log in" }, 
        { status: 401 }
      )
    }

    // Request validation
    const body = await req.json()
    if (!validateEventData(body)) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid request data" }, 
        { status: 400 }
      )
    }

    const { day, time, task_name, color } = body

    // Check for existing event
    const [existing] = await db.execute<TimetableRow[]>(
      "SELECT tt_id FROM timetable WHERE user_id = ? AND day = ? AND time = ?",
      [userId, day, time]
    )

    let result: ResultSetHeader
    let eventId: number

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing event
      const existingEvent = existing[0]
      ;[result] = await db.execute<ResultSetHeader>(
        "UPDATE timetable SET task_name = ?, color = ? WHERE tt_id = ? AND user_id = ?",
        [task_name, color, existingEvent.tt_id, userId]
      )
      eventId = existingEvent.tt_id
    } else {
      // Create new event
      ;[result] = await db.execute<ResultSetHeader>(
        "INSERT INTO timetable (user_id, day, time, task_name, color) VALUES (?, ?, ?, ?, ?)",
        [userId, day, time, task_name, color]
      )
      eventId = result.insertId
    }

    // Success response
    return NextResponse.json<TimetableEvent>({
      id: eventId,
      day,
      time,
      event: task_name,
      color,
    })

  } catch (error: unknown) {
    console.error("Error in timetable operation:", error)
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json<ErrorResponse>(
      { error: "Database error", message }, 
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    // Authentication check
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!validateUserId(userId)) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized - Please log in" }, 
        { status: 401 }
      )
    }

    // Fetch timetable data
    const [rows] = await db.execute<TimetableRow[]>(
      `SELECT tt_id AS id, day, time, task_name AS event, color
       FROM timetable
       WHERE user_id = ?
       ORDER BY 
         CASE day
           WHEN 'Sunday' THEN 0
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
         END,
       time`,
      [userId]
    )

    // Type-safe response
    const timetableEvents: TimetableEvent[] = rows.map(row => ({
      id: row.id,
      day: row.day,
      time: row.time,
      event: row.event,
      color: row.color
    }))

    return NextResponse.json<TimetableEvent[]>(timetableEvents)

  } catch (error: unknown) {
    console.error("GET /api/timetable error:", error)
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json<ErrorResponse>(
      { error: "Internal Server Error", message }, 
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    // Authentication check
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!validateUserId(userId)) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized" }, 
        { status: 401 }
      )
    }

    // Request validation
    const body = await req.json()
    if (!validateEventId(body)) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing or invalid event ID" }, 
        { status: 400 }
      )
    }

    const { id } = body

    // Delete event
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM timetable WHERE tt_id = ? AND user_id = ?",
      [id, userId]
    )

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: "Event not found or not owned by user" }, 
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Event deleted successfully" }
    )

  } catch (error: unknown) {
    console.error("Error deleting event:", error)
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to delete event", message }, 
      { status: 500 }
    )
  }
}