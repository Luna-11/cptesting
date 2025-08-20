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
        pm.method_name
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
      payment_date: payment.payment_date
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

    // 2. Validate request body
    const body: SubscriptionActionRequest = await request.json();
    const { paymentId, action, rejectionReason } = body;
    
    if (!paymentId || !action) {
      return NextResponse.json(
        { 
          status: 'error',
          error: "Payment ID and action are required" 
        },
        { status: 400 }
      );
    }

    const numericPaymentId = Number(paymentId);
    const numericAdminId = Number(adminId);

    if (isNaN(numericPaymentId) || isNaN(numericAdminId)) {
      return NextResponse.json(
        { 
          status: 'error',
          error: "Invalid numeric values" 
        },
        { status: 400 }
      );
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // 3. Get payment details and verify user exists
      const [payments] = await connection.execute<PaymentRow[]>(
        `SELECT up.*, u.role_id
         FROM user_payments up
         JOIN user u ON up.user_id = u.user_id
         WHERE up.payment_id = ?`,
        [numericPaymentId]
      );

      if (payments.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { 
            status: 'error',
            error: "Payment not found" 
          },
          { status: 404 }
        );
      }

      const payment = payments[0];

      // 4. Process based on action
      if (action === 'approve') {
        // Check if user_payments table has approval columns
        const [columns] = await connection.execute<RowDataPacket[]>(
          `SHOW COLUMNS FROM user_payments LIKE 'approved_by'`
        );

        if (columns.length > 0) {
          // Table has approval columns, update with approval info
          const [updateResult] = await connection.execute<ResultSetHeader>(
            `UPDATE user_payments 
             SET status = 'Approved', 
                 approved_date = NOW(), 
                 approved_by = ?,
                 rejection_reason = NULL
             WHERE payment_id = ?`,
            [numericAdminId, numericPaymentId]
          );

          if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return NextResponse.json(
              { 
                status: 'error',
                error: "Failed to approve payment" 
              },
              { status: 500 }
            );
          }
        } else {
          // Table doesn't have approval columns, just update status
          const [updateResult] = await connection.execute<ResultSetHeader>(
            `UPDATE user_payments 
             SET status = 'Approved'
             WHERE payment_id = ?`,
            [numericPaymentId]
          );

          if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return NextResponse.json(
              { 
                status: 'error',
                error: "Failed to approve payment" 
              },
              { status: 500 }
            );
          }
        }

        // Update user role to pro (role_id = 3)
        const [userUpdateResult] = await connection.execute<ResultSetHeader>(
          `UPDATE user 
           SET role_id = 3
           WHERE user_id = ?`,
          [payment.user_id]
        );

        if (userUpdateResult.affectedRows === 0) {
          await connection.rollback();
          return NextResponse.json(
            { 
              status: 'error',
              error: "Failed to update user role" 
            },
            { status: 500 }
          );
        }

      } else if (action === 'reject') {
        // Check if user_payments table has rejection columns
        const [columns] = await connection.execute<RowDataPacket[]>(
          `SHOW COLUMNS FROM user_payments LIKE 'rejection_reason'`
        );

        if (columns.length > 0) {
          // Table has rejection columns, update with rejection info
          const [updateResult] = await connection.execute<ResultSetHeader>(
            `UPDATE user_payments 
             SET status = 'Rejected', 
                 rejection_reason = ?
             WHERE payment_id = ?`,
            [rejectionReason || 'Payment rejected by admin', numericPaymentId]
          );

          if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return NextResponse.json(
              { 
                status: 'error',
                error: "Failed to reject payment" 
              },
              { status: 500 }
            );
          }
        } else {
          // Table doesn't have rejection columns, just update status
          const [updateResult] = await connection.execute<ResultSetHeader>(
            `UPDATE user_payments 
             SET status = 'Rejected'
             WHERE payment_id = ?`,
            [numericPaymentId]
          );

          if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return NextResponse.json(
              { 
                status: 'error',
                error: "Failed to reject payment" 
              },
              { status: 500 }
            );
          }
        }

      } else {
        await connection.rollback();
        return NextResponse.json(
          { 
            status: 'error',
            error: "Invalid action. Must be 'approve' or 'reject'" 
          },
          { status: 400 }
        );
      }

      // Commit transaction
      await connection.commit();

      // Get updated payment details for response
      const [updatedPayment] = await connection.execute<PaymentWithUser[]>(
        `SELECT 
          up.*,
          u.name as user_name,
          u.email as user_email,
          pm.method_name
         FROM user_payments up
         JOIN user u ON up.user_id = u.user_id
         JOIN payment_methods pm ON up.method_id = pm.method_id
         WHERE up.payment_id = ?`,
        [numericPaymentId]
      );

      return NextResponse.json({
        status: 'success',
        message: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        payment: updatedPayment[0]
      });

    } catch (innerError: any) {
      await connection.rollback();
      console.error('Error in POST /api/admin/subscriptions transaction:', innerError);
      return NextResponse.json(
        { 
          status: 'error',
          error: `Failed to ${action} payment`,
          details: process.env.NODE_ENV === 'development' ? innerError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in POST /api/admin/subscriptions:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: "Payment processing failed"
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}