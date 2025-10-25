import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@script/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

interface PaymentRequest {
  methodId: number;
  months: number;
  amount: number;
  receiptImage: string | File;
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

// Helper function to validate database connection
const getDatabaseConnection = async () => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Database connection unavailable');
  }
};

// Convert File to Base64
const fileToBase64 = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  
  // Determine MIME type from file type
  let mimeType = 'image/jpeg';
  if (file.type) {
    mimeType = file.type;
  } else if (file.name) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    mimeType = mimeTypes[extension || ''] || 'image/jpeg';
  }
  
  return `data:${mimeType};base64,${base64}`;
};

// Helper function to save image to filesystem
const saveImageToFileSystem = async (base64Data: string, userId: number, paymentId: number): Promise<string> => {
  try {
    // Validate base64 format
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data format');
    }

    const mimeType = matches[1];
    const extension = mimeType.split('/')[1] || 'jpg';
    const base64String = matches[2];
    
    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid image type. Allowed: JPEG, PNG, GIF, WebP');
    }

    // Create buffer from base64
    const buffer = Buffer.from(base64String, 'base64');
    
    // Validate file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('Image too large. Maximum size is 5MB.');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `receipt_${userId}_${paymentId}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return relative path for database storage
    return `/uploads/receipts/${filename}`;

  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to validate base64 image
const validateBase64Image = (base64Data: string): boolean => {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return false;
    }

    // Validate it's actually base64
    const base64String = matches[2];
    try {
      Buffer.from(base64String, 'base64');
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
};

// Helper to process image input (handles both base64 and File)
const processImageInput = async (imageInput: string | File): Promise<string> => {
  if (typeof imageInput === 'string') {
    // It's already a base64 string
    if (!validateBase64Image(imageInput)) {
      throw new Error('Invalid base64 image format');
    }
    return imageInput;
  } else if (imageInput instanceof File) {
    // Convert File to base64
    return await fileToBase64(imageInput);
  } else {
    throw new Error('Invalid image format. Must be base64 string or File object');
  }
};

export async function POST(req: Request) {
  let connection;
  
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

    // 2. Parse form data (supports both JSON and FormData)
    let body: PaymentRequest;
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = {
        methodId: Number(formData.get('methodId')),
        months: Number(formData.get('months')),
        amount: Number(formData.get('amount')),
        receiptImage: formData.get('receiptImage') as File
      };
    } else {
      // Assume JSON
      body = await req.json();
    }

    const { methodId, months, amount, receiptImage } = body;

    if (!methodId || !months || !amount || !receiptImage) {
      return NextResponse.json(
        { error: "Missing required fields: methodId, months, amount, receiptImage" },
        { status: 400 }
      );
    }

    // Convert numeric values
    const numericUserId = Number(userId);
    const numericMethodId = Number(methodId);
    const numericMonths = Number(months);
    const numericAmount = Number(amount);

    if (
      isNaN(numericUserId) ||
      isNaN(numericMethodId) ||
      isNaN(numericMonths) ||
      isNaN(numericAmount)
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values in request" },
        { status: 400 }
      );
    }

    // Validate amount calculation
    const expectedAmount = numericMonths * 5;
    if (Math.abs(numericAmount - expectedAmount) > 0.01) {
      return NextResponse.json(
        { error: "Invalid amount calculation" },
        { status: 400 }
      );
    }

    // Process image input first
    let processedBase64: string;
    try {
      processedBase64 = await processImageInput(receiptImage);
    } catch (imageError: any) {
      return NextResponse.json(
        { error: "Invalid image format", details: imageError.message },
        { status: 400 }
      );
    }

    // Get database connection with validation
    connection = await getDatabaseConnection();
    
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

      // 4. Save image to filesystem first
      let filePath: string;
      try {
        // Create a temporary payment ID for the filename
        const tempPaymentId = Date.now();
        filePath = await saveImageToFileSystem(processedBase64, numericUserId, tempPaymentId);
      } catch (imageError: any) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Failed to process receipt image", details: imageError.message },
          { status: 400 }
        );
      }

      // 5. Insert payment record with image path
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO user_payments 
         (user_id, method_id, months, amount, receipt_image, status, payment_date)
         VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
        [
          numericUserId,
          numericMethodId,
          numericMonths,
          numericAmount,
          filePath
        ]
      );

      // 6. Get the complete payment record
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


      await connection.execute<ResultSetHeader>(
        `INSERT INTO notifications 
         (user_id, payment_id, title, message, type, status, purchase_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          numericUserId,
          result.insertId,
          "Payment Submitted",
          `Your payment of $${numericAmount.toFixed(2)} for ${numericMonths} month(s) is under review.`,
          "user", // User type
          "unread",
          "pending",
        ]
      );
      await connection.execute<ResultSetHeader>(
        `INSERT INTO notifications 
        (user_id, payment_id, title, message, type, status, purchase_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          numericUserId,
          result.insertId,
          "Payment Submitted",
          `User ${numericUserId} submitted a payment of $${numericAmount.toFixed(2)} for ${numericMonths} month(s).`,
          "admin", // Admin type
          "unread",
          "pending",
        ]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        paymentId: result.insertId,
        payment: insertedRecord[0],
        message: "Payment submitted successfully",
      });
    } catch (innerError: any) {
      await connection.rollback();
      console.error("Payment processing inner error:", innerError);
      
      if (innerError.code === 'ECONNRESET' || innerError.code === 'PROTOCOL_CONNECTION_LOST') {
        return NextResponse.json(
          {
            error: "Database connection issue. Please try again.",
            details: "Connection reset"
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        {
          error: "Payment processing failed",
          details: innerError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Payment processing error:", error);
    
    if (error.message.includes('Database connection unavailable') || 
        error.code === 'ECONNRESET') {
      return NextResponse.json(
        { 
          error: "Database temporarily unavailable. Please try again in a moment.",
          details: "Connection reset"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Payment processing failed",
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}

export async function GET(req: Request) {
  let connection;
  
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

    // Get database connection
    connection = await getDatabaseConnection();
    
    // 2. Get user's payment history
    const [payments] = await connection.execute<UserPayment[]>(
      `SELECT up.*, pm.method_name 
       FROM user_payments up
       JOIN payment_methods pm ON up.method_id = pm.method_id
       WHERE up.user_id = ?
       ORDER BY up.payment_id DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      payments
    });

  } catch (error: any) {
    console.error("Fetch payment history error:", error);
    
    if (error.message.includes('Database connection unavailable') || 
        error.code === 'ECONNRESET') {
      return NextResponse.json(
        { 
          error: "Database temporarily unavailable. Please try again later.",
          details: "Connection reset"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch payment history", 
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}