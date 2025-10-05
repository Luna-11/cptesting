// app/api/admin/subscriptions/route.ts
import { NextResponse } from "next/server";
import { db } from "@script/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface SubscriptionActionRequest {
  paymentId: number;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

interface PaymentRow extends RowDataPacket {
  payment_id: number;
  user_id: number;
  method_id: number;
  months: number;
  amount: number;
  receipt_image: string;
  status: string;
  payment_date: string;
  processed_at: string | null;
}

interface UserRow extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
}

interface PaymentWithUser extends PaymentRow {
  user_name: string;
  user_email: string;
  method_name: string;
}

// Helper function to parse cookies from request headers
function parseCookies(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return {};
  
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {} as Record<string, string>);
}

// GET all subscription payments for admin approval
export async function GET(request: Request) {
  const connection = await db.getConnection();
  
  try {
    // 1. Validate admin authentication using request headers
    const cookies = parseCookies(request);
    const adminId = cookies.userId;
    const role = cookies.role;
    
    if (!adminId || role !== 'admin') {
      return NextResponse.json(
        { 
          status: 'error',
          error: "Unauthorized - Admin access required" 
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    // Build status filter
    let statusFilter = '';
    let queryParams: any[] = [];
    
    if (status !== 'all') {
      statusFilter = 'AND up.status = ?';
      queryParams.push(status);
    }

    // Get total count
    const [countResult] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total 
       FROM user_payments up
       WHERE 1=1 ${statusFilter}`,
      queryParams
    );

    const total = countResult[0]?.total || 0;

    // Get paginated payments with user and method info
    const [payments] = await connection.execute<PaymentWithUser[]>(
      `SELECT 
        up.*,
        u.name as user_name,
        u.email as user_email,
        pm.method_name,
        up.processed_at
       FROM user_payments up
       JOIN user u ON up.user_id = u.user_id
       JOIN payment_methods pm ON up.method_id = pm.method_id
       WHERE 1=1 ${statusFilter}
       ORDER BY up.payment_date DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Transform data for response
    const transformedPayments = payments.map(payment => ({
      payment_id: payment.payment_id,
      user_id: payment.user_id,
      user_name: payment.user_name,
      user_email: payment.user_email,
      method_name: payment.method_name,
      status: payment.status,
      months: payment.months,
      amount: payment.amount,
      receipt_image: payment.receipt_image,
      payment_date: payment.payment_date,
      approved_at: payment.processed_at 
    }));

    return NextResponse.json({
      status: 'success',
      data: {
        payments: transformedPayments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasPrev: page > 1,
          hasNext: page < Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/subscriptions:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: "Failed to fetch subscription payments",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// POST - Approve or reject subscription payment
export async function POST(request: Request) {
  const connection = await db.getConnection();
  
  try {
    const cookies = parseCookies(request);
    const adminId = cookies.userId;
    const role = cookies.role;
    
    if (!adminId || role !== 'admin') {
      return NextResponse.json(
        { status: 'error', error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body: SubscriptionActionRequest = await request.json();
    const { paymentId, action, rejectionReason } = body;
    
    if (!paymentId || !action) {
      return NextResponse.json(
        { status: 'error', error: "Payment ID and action are required" },
        { status: 400 }
      );
    }

    const numericPaymentId = Number(paymentId);
    if (isNaN(numericPaymentId)) {
      return NextResponse.json(
        { status: 'error', error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    try {
      // 1. Get payment + user details
      const [payments] = await connection.execute<PaymentRow[]>(
        `SELECT up.*, u.name, u.email, u.role_id 
         FROM user_payments up
         JOIN user u ON up.user_id = u.user_id
         WHERE up.payment_id = ?`,
        [numericPaymentId]
      );

      if (payments.length === 0) {
        await connection.rollback();
        return NextResponse.json({ status: 'error', error: "Payment not found" }, { status: 404 });
      }

      const payment = payments[0];
      let newStatus = "";
      let purchaseStatus = "";

      // 2. Update payment status
      if (action === "approve") {
        newStatus = "Approved";
        purchaseStatus = "approved";
        await connection.execute<ResultSetHeader>(
          `UPDATE user_payments SET status = ?, processed_at = NOW() WHERE payment_id = ?`,
          [newStatus, numericPaymentId]
        );

        // Upgrade user role to PRO (role_id = 3)
        await connection.execute<ResultSetHeader>(
          `UPDATE user SET role_id = 3 WHERE user_id = ?`,
          [payment.user_id]
        );

      } else if (action === "reject") {
        newStatus = "Rejected";
        purchaseStatus = "rejected";
        await connection.execute<ResultSetHeader>(
          `UPDATE user_payments SET status = ?, processed_at = NOW() WHERE payment_id = ?`,
          [newStatus, numericPaymentId]
        );
      } else {
        await connection.rollback();
        return NextResponse.json(
          { status: 'error', error: "Invalid action. Must be 'approve' or 'reject'" },
          { status: 400 }
        );
      }

      // 3. Insert notification for the user with correct status and purchase_status
      const notifMessage =
        newStatus === "Approved"
          ? `🎉 Your subscription payment #${numericPaymentId} has been approved. You now have Pro access!`
          : `❌ Your subscription payment #${numericPaymentId} has been rejected.${rejectionReason ? " Reason: " + rejectionReason : ""}`;

      const notifTitle =
        newStatus === "Approved"
          ? "Subscription Approved"
          : "Subscription Rejected";

      await connection.execute(
        `INSERT INTO notifications 
          (user_id, payment_id, title, message, type, status, purchase_status, created_at)
         VALUES (?, ?, ?, ?, 'user', 'unread', ?, NOW())`,
        [
          payment.user_id, 
          numericPaymentId, 
          notifTitle,
          notifMessage, 
          purchaseStatus
        ]
      );

      await connection.commit();

      // 4. Get updated payment details for response
      const [updatedPayment] = await connection.execute<PaymentWithUser[]>(
        `SELECT 
          up.*,
          u.name as user_name,
          u.email as user_email,
          pm.method_name,
          up.processed_at
         FROM user_payments up
         JOIN user u ON up.user_id = u.user_id
         JOIN payment_methods pm ON up.method_id = pm.method_id
         WHERE up.payment_id = ?`,
        [numericPaymentId]
      );

      return NextResponse.json({
        status: "success",
        message: `Payment ${newStatus.toLowerCase()} successfully`,
        payment: {
          ...updatedPayment[0],
          receipt_image: updatedPayment[0].receipt_image,
          approved_at: updatedPayment[0].processed_at 
        }
      });

    } catch (innerError: any) {
      await connection.rollback();
      console.error("Error in POST /api/admin/subscriptions transaction:", innerError);
      return NextResponse.json(
        { 
          status: "error", 
          error: `Failed to ${action} payment`,
          details: process.env.NODE_ENV === 'development' ? innerError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in POST /api/admin/subscriptions:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: "Payment processing failed",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}