// app/api/focus-settings/route.ts
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth/next"
import { db } from "@script/db"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { focusDuration } = body
    
    // Only allow duration change if user is Pro
    if (session.user.role !== 3) {
      return NextResponse.json({ error: "Pro feature only" }, { status: 403 })
    }

    await db.execute(
      `INSERT INTO focus_settings (user_id, focus_duration) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE focus_duration = VALUES(focus_duration)`,
      [session.user.id, focusDuration]
    )

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [settings] = await db.execute<any[]>(
      `SELECT focus_duration FROM focus_settings WHERE user_id = ?`,
      [session.user.id]
    )

    const defaultDuration = 1500
    const isProUser = session.user.role === 3 // Check role directly

    return NextResponse.json({
      focus_duration: settings?.[0]?.focus_duration || defaultDuration,
      is_pro_user: isProUser
    })
    
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      focus_duration: 1500,
      is_pro_user: false 
    })
  }
}