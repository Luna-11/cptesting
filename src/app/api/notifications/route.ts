import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@script/db";

// GET - Fetch notifications based on user role
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const role = cookieStore.get("role")?.value;

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const numericUserId = Number(userId);

    let query = `
      SELECT * 
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    let params: any[] = [numericUserId];

    if (role === "admin") {
      query = `
        SELECT * 
        FROM notifications 
        WHERE type = 'admin' 
        ORDER BY created_at DESC
      `;
      params = [];
    }

    const [rows] = await db.execute(query, params);

    return NextResponse.json({ success: true, notifications: rows });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// POST - Create notification OR mark all as read
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Case 1: Mark all as read
    if (body.action === "markAllRead") {
      await db.execute(
        `UPDATE notifications SET status = 'read' WHERE user_id = ?`,
        [userId]
      );
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    // Case 2: Create new notification
    const {
      message,
      type = "user",
      payment_id,
      purchase_status,
      title = "New Notification",
    } = body;

    const [result] = await db.execute(
      `INSERT INTO notifications (user_id, payment_id, title, message, type, status, purchase_status, created_at)
       VALUES (?, ?, ?, ?, ?, 'unread', ?, NOW())`,
      [userId, payment_id || null, title, message, type, purchase_status || null]
    );

    return NextResponse.json({
      success: true,
      id: (result as any).insertId,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// PUT - Update purchase status and create notification
export async function PUT(req: Request) {
  try {
    const { status, userId, purchaseId } = await req.json();

    if (!status || !userId || !purchaseId) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // 1. Update the purchase status
    await db.execute(
      `UPDATE purchases SET status = ?, approved_date = NOW() WHERE purchase_id = ?`,
      [status, purchaseId]
    );

    // 2. Add a notification for the user
    const message =
      status === "approved"
        ? `Your payment for purchase #${purchaseId} has been approved. 🎉`
        : `Your payment for purchase #${purchaseId} has been ${status}.`;

    await db.execute(
      `INSERT INTO notifications 
        (user_id, payment_id, title, message, type, status, purchase_status, created_at) 
       VALUES (?, ?, 'Payment Update', ?, 'user', 'unread', ?, NOW())`,
      [userId, purchaseId, message, status]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approval update error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
