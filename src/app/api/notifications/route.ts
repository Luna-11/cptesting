import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@script/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

interface Notification extends RowDataPacket {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  purchase_status?: string;
}

export async function GET() {
  try {
    const cookieStore =await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications] = await db.execute<Notification[]>(`
      SELECT n.*, pn.status AS purchase_status
      FROM notifications n
      LEFT JOIN purchase_notifications pn ON n.notification_id = pn.notification_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [userId]);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore =await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [userId, title, message, type]
    );

    return NextResponse.json({
      success: true,
      notificationId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore =await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    await db.execute(
      "UPDATE notifications SET status = 'read' WHERE notification_id = ? AND user_id = ?",
      [notificationId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}