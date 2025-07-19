// src/app/api/timetable/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@script/db"

export async function POST(req: Request) {
  try {
    // Get cookies - must await the cookies() function
    const cookieStore = await cookies() // Add await here
    const userIdCookie = cookieStore.get('userId') // Now this will work
    
    if (!userIdCookie?.value) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    const userId = userIdCookie.value

    const body = await req.json()
    const { date, time, task_name } = body

    if (!date || !time || !task_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const formattedDate = new Date(date).toISOString().split('T')[0]

    const [result] = await db.execute(
      "INSERT INTO timetable (user_id, date, time, task_name) VALUES (?, ?, ?, ?)",
      [userId, formattedDate, time, task_name]
    )

    return NextResponse.json({ 
      success: true, 
      message: "Timetable entry added successfully",
      result 
    })

  } catch (error: any) {
    console.error("Error inserting timetable:", error)
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json(
        { 
          error: "User not found",
          message: "The logged-in user doesn't exist in the database"
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: "Database error",
        message: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Also await cookies() in GET method
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [rows] = await db.execute(
      "SELECT date, time, task_name FROM timetable WHERE user_id = ? ORDER BY date, time",
      [userId]
    )

    return NextResponse.json({ 
      success: true,
      data: rows 
    })

  } catch (error: any) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
      { status: 500 }
    )
  }
}