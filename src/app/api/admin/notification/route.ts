import { NextResponse } from "next/server";
import { db } from "@script/db";
import type { RowDataPacket } from "mysql2/promise";

interface AdminNotification extends RowDataPacket {
  notification_id: number;
  user_id: number;
  payment_id: number | null;
  title: string;
  message: string;
  type: "user" | "admin" | "system";
  status: "unread" | "read";
  purchase_status: "pending" | "approved" | "rejected" | null;
  link: string | null;
  created_at: string;
  user_name: string;
  user_email: string;
  category: string;
}

// ✅ Database connection helper
const getDatabaseConnection = async () => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Database connection unavailable");
  }
};

export async function GET(req: Request) {
  let connection;

  try {
    // 1. Connect to DB
    connection = await getDatabaseConnection();

    // 2. Fetch notifications
    const [notifications] = await connection.execute<AdminNotification[]>(
      `SELECT n.notification_id, n.user_id, n.payment_id, n.title, n.message, 
              n.type, n.status, n.purchase_status, n.link, n.created_at,
              u.name AS user_name, u.email AS user_email,
              CASE 
                WHEN n.purchase_status = 'pending' THEN 'Payment Submission'
                ELSE 'Payment Update'
              END AS category
       FROM notifications n
       JOIN user u ON n.user_id = u.user_id
       WHERE n.type = 'admin'
       ORDER BY n.created_at DESC
       LIMIT 10`
    );

    return NextResponse.json({
      status: "success",
      message: "Fetched admin notifications",
      data: notifications,
    });
  } catch (error: any) {
    console.error("Fetch admin notifications error:", error);

    if (
      error.message.includes("Database connection unavailable") ||
      error.code === "ECONNRESET"
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database temporarily unavailable. Please try again later.",
          details: "Connection reset",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch notifications",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}
