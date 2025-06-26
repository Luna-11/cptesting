import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Types
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

type SuccessResponse = {
  success: true;
  userId: number;
};

// POST Route
export async function POST(request: Request) {
  const parseResult = await safeParseRequest(request);
  if (!parseResult.success) {
    return NextResponse.json(parseResult, { status: 400 });
  }

  const { email, username, password, studyLevel, dailyStudyGoal } = parseResult.data;

  // Additional validation
  if (!validateEmail(email)) {
    return NextResponse.json(
      { success: false, error: "Invalid email format" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { success: false, error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (dailyStudyGoal && (isNaN(dailyStudyGoal) || dailyStudyGoal <= 0)) {
    return NextResponse.json(
      { success: false, error: "Daily study goal must be a positive number" },
      { status: 400 }
    );
  }

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

// Helper: Email validation
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Helper: safely parse and validate request body
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
        dailyStudyGoal: data.dailyStudyGoal !== undefined ? Number(data.dailyStudyGoal) : undefined
      }
    };
  } catch {
    return { success: false, error: "Invalid JSON data" };
  }
}

// Helper: perform registration and database insertion
async function registerUser(data: RegistrationData): Promise<SuccessResponse | ErrorResponse> {
  let connection;
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'studywithme'
    });

    const [result] = await connection.execute(
      `INSERT INTO user (name, email, password, goal, studyLevel, role_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.username,
        data.email,
        hashedPassword,
        data.dailyStudyGoal || null, // Handle undefined goal
        data.studyLevel || null,     // Handle undefined studyLevel
        2                            // Default role_id
      ]
    );

    const insertResult = result as mysql.ResultSetHeader;
    return { success: true, userId: insertResult.insertId };

  } catch (err: unknown) {
    console.error('Registration failed:', err);

    if (isMySQLDuplicateError(err)) {
      return { success: false, error: "Email already registered" };
    }

    if (isDatabaseConnectionError(err)) {
      return { success: false, error: "Database connection failed" };
    }

    if (isMySQLMissingColumnError(err)) {
      return { success: false, error: "Database configuration error" };
    }

    return {
      success: false,
      error: "Registration failed",
      ...(process.env.NODE_ENV === 'development' && { details: err })
    };
  } finally {
    if (connection) await connection.end();
  }
}

// Error type guards
function isMySQLDuplicateError(err: unknown): boolean {
  return typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'ER_DUP_ENTRY';
}

function isDatabaseConnectionError(err: unknown): boolean {
  return typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR'].includes((err as any).code);
}

function isMySQLMissingColumnError(err: unknown): boolean {
  return typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'ER_BAD_FIELD_ERROR';
}