import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

type RegistrationData = {
  email: string;
  username: string;
  password: string;
  studyLevel?: string;
  dailyStudyGoal?: number;
};

type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

export async function POST(request: Request) {
  // 1. Parse and validate input
  const parseResult = await safeParseRequest(request);
  if (!parseResult.success) {
    return NextResponse.json(parseResult, { status: 400 });
  }
  const { email, username, password, studyLevel, dailyStudyGoal } = parseResult.data;

  // 2. Process registration
  const registrationResult = await registerUser({
    email,
    username,
    password,
    studyLevel,
    dailyStudyGoal
  });

  return registrationResult.success
    ? NextResponse.json(registrationResult)
    : NextResponse.json(registrationResult, { status: 500 });
}

// Helper functions
async function safeParseRequest(request: Request): Promise<
  { success: true; data: RegistrationData } | ErrorResponse
> {
  try {
    const data = await request.json();
    
    if (!data.email?.trim()) return { success: false, error: "Email is required" };
    if (!data.username?.trim()) return { success: false, error: "Username is required" };
    if (!data.password) return { success: false, error: "Password is required" };

    return {
      success: true,
      data: {
        email: data.email.trim(),
        username: data.username.trim(),
        password: data.password,
        studyLevel: data.studyLevel?.trim(),
        dailyStudyGoal: Number(data.dailyStudyGoal) || undefined
      }
    };
  } catch {
    return { success: false, error: "Invalid JSON data" };
  }
}

async function registerUser(data: RegistrationData): Promise<
  { success: true; userId: number } | ErrorResponse
> {
  let connection;
  try {
    // 1. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 2. Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'studywithme'
    });

    // 3. Execute query
    const [result] = await connection.execute(
      `INSERT INTO user 
       (name, email, password, goal, studyLevel) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.username,
        data.email,
        hashedPassword,
        data.dailyStudyGoal ?? null,
        data.studyLevel ?? null
      ]
    );

    // Type assertion for mysql2 result
    const insertResult = result as mysql.ResultSetHeader;
    return { success: true, userId: insertResult.insertId };

  } catch (err: unknown) {
    // Log full error for debugging
    console.error('Registration failed:', {
      timestamp: new Date(),
      error: err
    });

    // User-friendly error messages
    if (isMySQLDuplicateError(err)) {
      return { success: false, error: "Email already registered" };
    }

    if (isDatabaseConnectionError(err)) {
      return { success: false, error: "Database connection failed" };
    }

    return { 
      success: false, 
      error: "Registration failed",
      ...(process.env.NODE_ENV === 'development' && {
        details: err instanceof Error ? err : undefined
      })
    };
  } finally {
    if (connection) await connection.end();
  }
}

// Type guards for specific errors
function isMySQLDuplicateError(err: unknown): boolean {
  return err instanceof Error && 
    'code' in err && 
    err.code === 'ER_DUP_ENTRY';
}

function isDatabaseConnectionError(err: unknown): boolean {
  return err instanceof Error && 
    ('code' in err && ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR'].includes(err.code as string));
}