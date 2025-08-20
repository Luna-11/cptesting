import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@script/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface PaymentRequest {
  methodId: number;
  months: number;
  amount: number;
  receiptImage: string;
}

interface PaymentMethod extends RowDataPacket {
  method_id: number;
  method_name: string;
}

interface UserPayment extends RowDataPacket {
  payment_id: number;
  user_id: number;
  method_id: number;
  months: number;
  amount: number;
  receipt_image: string;
  status: string;
  payment_date: string;
  method_name?: string;
}

// Payment submission endpoint
export async function POST(req: Request) {
  const connection = await db.getConnection();
  
  try {
    // 1. Validate user authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body: PaymentRequest = await req.json();
    const { methodId, months, amount, receiptImage } = body;
    
    // Validate all required fields
    if (!methodId || !months || !amount || !receiptImage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert and validate numeric values
    const numericUserId = Number(userId);
    const numericMethodId = Number(methodId);
    const numericMonths = Number(months);
    const numericAmount = Number(amount);

    if (isNaN(numericUserId) || isNaN(numericMethodId) || 
        isNaN(numericMonths) || isNaN(numericAmount)) {
      return NextResponse.json(
        { error: "Invalid numeric values" },
        { status: 400 }
      );
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // 3. Verify payment method exists
      const [methods] = await connection.execute<PaymentMethod[]>(
        "SELECT method_id, method_name FROM payment_methods WHERE method_id = ?",
        [numericMethodId]
      );

      if (methods.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 }
        );
      }

      // 4. Insert payment record with explicit auto-increment handling
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO user_payments 
         (user_id, method_id, months, amount, receipt_image, status, payment_date)
         VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
        [numericUserId, numericMethodId, numericMonths, numericAmount, receiptImage]
      );

      // 5. Get the complete inserted record with payment method name
      const [insertedRecord] = await connection.execute<UserPayment[]>(
        `SELECT up.*, pm.method_name 
         FROM user_payments up
         JOIN payment_methods pm ON up.method_id = pm.method_id
         WHERE up.payment_id = ?`,
        [result.insertId]
      );

      if (insertedRecord.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Payment record verification failed" },
          { status: 500 }
        );
      }

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        success: true,
        paymentId: result.insertId,
        payment: insertedRecord[0],
        message: "Payment submitted successfully"
      });

    } catch (innerError: any) {
      await connection.rollback();
      return NextResponse.json(
        { 
          error: "Payment processing failed",
          details: process.env.NODE_ENV === 'development' ? innerError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Purchase history endpoint
export async function GET(req: Request) {
  const connection = await db.getConnection();
  
  try {
    // 1. Validate user authentication
    const cookieStore =await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // 2. Get user's payment history
    const [payments] = await connection.execute<UserPayment[]>(
      `SELECT up.*, pm.method_name 
       FROM user_payments up
       JOIN payment_methods pm ON up.method_id = pm.method_id
       WHERE up.user_id = ?
       ORDER BY up.payment_id DESC`, // Fixed ordering by payment_id DESC
      [userId]
    );

    return NextResponse.json({
      success: true,
      payments
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch payment history", details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}