import { NextResponse } from "next/server";
import { db } from "@script/db";

// GET all notifications for logged-in user
export async function GET(req: Request) {
  try {
    // get userId from cookie (set at login)
    const cookieHeader = req.headers.get("cookie") || "";
    const userIdMatch = cookieHeader.match(/userId=(\d+)/);
    if (!userIdMatch) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = userIdMatch[1];

    const [rows] = await db.execute(
      `SELECT * FROM notification WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT - mark notification as read
export async function PUT(req: Request) {
  try {
    const { notificationId } = await req.json();

    await db.execute(
      `UPDATE notification SET status = 'read' WHERE notification_id = ?`,
      [notificationId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
