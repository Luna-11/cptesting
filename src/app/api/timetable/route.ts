import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@script/db"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

const ALL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const
type Day = (typeof ALL_DAYS)[number]

interface TimetableRow extends RowDataPacket {
  tt_id: number
  user_id: number
  day: Day
  time: string
  task_name: string
  color: string
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    const body = await req.json()
    const { day, time, task_name, color } = body
    if (!day || !time || !task_name || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!ALL_DAYS.includes(day)) {
      return NextResponse.json({ error: "Invalid day provided" }, { status: 400 })
    }

    // Check for existing event with proper typing
    const [existing] = await db.execute<TimetableRow[]>(
      "SELECT tt_id FROM timetable WHERE user_id = ? AND day = ? AND time = ?",
      [userId, day, time]
    )

    if (Array.isArray(existing) && existing.length > 0) {
      const existingEvent = existing[0]
      const [result] = await db.execute<ResultSetHeader>(
        "UPDATE timetable SET task_name = ?, color = ? WHERE tt_id = ? AND user_id = ?",
        [task_name, color, existingEvent.tt_id, userId]
      )

      return NextResponse.json({
        success: true,
        message: "Timetable entry updated successfully",
        data: {
          id: existingEvent.tt_id,
          day,
          time,
          event: task_name,
          color,
        },
      })
    } else {
      const [result] = await db.execute<ResultSetHeader>(
        "INSERT INTO timetable (user_id, day, time, task_name, color) VALUES (?, ?, ?, ?, ?)",
        [userId, day, time, task_name, color]
      )

      return NextResponse.json({
        success: true,
        message: "Timetable entry added successfully",
        data: {
          id: result.insertId,
          day,
          time,
          event: task_name,
          color,
        },
      })
    }
  } catch (error: any) {
    console.error("Error in timetable operation:", error)
    return NextResponse.json({ error: "Database error", message: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

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

    return NextResponse.json(rows)
  } catch (error) {
    console.error("GET /api/timetable error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 })
    }

    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM timetable WHERE tt_id = ? AND user_id = ?",
      [id, userId]
    )

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}