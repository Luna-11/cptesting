import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@script/db";

// In your /api/notifications/route.ts GET endpoint
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
      WHERE user_id = ? AND type = 'user'  -- ADDED type filter for users
      ORDER BY created_at DESC
    `;
    let params: any[] = [numericUserId];

    if (role === "admin") {
      query = `
        SELECT * 
        FROM notifications 
        WHERE type = 'admin'  -- ONLY show admin notifications to admins
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
    const role = cookieStore.get("role")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Case 1: Mark all as read
    if (body.action === "markAllRead") {
      let query = `UPDATE notifications SET status = 'read' WHERE user_id = ?`;
      let params: any[] = [userId];

      // If admin, mark all admin notifications as read
      if (role === "admin") {
        query = `UPDATE notifications SET status = 'read' WHERE type = 'admin'`;
        params = [];
      }

      await db.execute(query, params);
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

// PUT - Update single notification as read OR update purchase status
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const role = cookieStore.get("role")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Case 1: Mark single notification as read
    if (body.notificationId) {
      let query = `UPDATE notifications SET status = 'read' WHERE notification_id = ? AND user_id = ?`;
      let params: any[] = [body.notificationId, userId];

      // If admin, allow marking admin notifications as read
      if (role === "admin") {
        query = `UPDATE notifications SET status = 'read' WHERE notification_id = ? AND type = 'admin'`;
        params = [body.notificationId];
      }

      await db.execute(query, params);
      return NextResponse.json({ success: true, message: "Marked as read" });
    }

    // Case 2: Update purchase status and create notification (existing functionality)
    const { status, userId: targetUserId, purchaseId } = body;

    if (!status || !targetUserId || !purchaseId) {
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
        ? `Payment is approved. #${purchaseId} Please log out and log back in to unlock all Pro features!`
        : `Your payment for purchase #${purchaseId} has been ${status}.`;

    await db.execute(
      `INSERT INTO notifications 
        (user_id, payment_id, title, message, type, status, purchase_status, created_at) 
       VALUES (?, ?, 'Payment Update', ?, 'user', 'unread', ?, NOW())`,
      [targetUserId, purchaseId, message, status]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}