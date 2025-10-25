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
    connection = await getDatabaseConnection();


    const [allUser17Notifications] = await connection.execute<AdminNotification[]>(
      `SELECT * FROM notifications WHERE user_id = 17 ORDER BY created_at DESC`
    );

    console.log("ALL notifications for user 17:", allUser17Notifications);


    const [notifications] = await connection.execute<AdminNotification[]>(
      `SELECT 
         n.notification_id, 
         n.user_id, 
         n.payment_id, 
         n.title, 
         n.message, 
         n.type, 
         n.status, 
         n.purchase_status, 
         n.link, 
         n.created_at,
         u.name AS user_name, 
         u.email AS user_email,
         CASE 
           WHEN n.purchase_status = 'pending' THEN 'Payment Submission'
           ELSE 'Payment Update'
         END AS category
       FROM notifications n
       JOIN user u ON n.user_id = u.user_id
       WHERE n.type IN ('admin', 'system')
         AND (n.payment_id IS NOT NULL OR n.purchase_status IS NOT NULL)
       ORDER BY n.created_at DESC
       LIMIT 20`
    );

    console.log("Current query results count:", notifications.length);
    
    // Find which user 17 notifications are missing
    const missingNotifications = allUser17Notifications.filter(notif => 
      !notifications.some(n => n.notification_id === notif.notification_id)
    );
    
    console.log("User 17 notifications missing from results:", missingNotifications);

    return NextResponse.json({
      status: "success",
      message: "Fetched admin notifications",
      data: notifications,
      debug: {
        allUser17Notifications,
        missingNotifications,
        currentQueryCount: notifications.length
      }
    });
  } catch (error: any) {
    console.error("Fetch admin notifications error:", error);
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
      connection.release();
    }
  }
}