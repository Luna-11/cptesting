import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, username, password, studyLevel, dailyStudyGoal } = await request.json();

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'studywithme'
    });

    try {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT 1 FROM user WHERE email = ? OR name = ?',
        [email, username]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: "Email or username already exists" },
          { status: 409 }
        );
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await connection.execute(
        'INSERT INTO user (name, email, password, goal, studyLevel, role_id) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, dailyStudyGoal || null, studyLevel || null, 2]
      );

      return NextResponse.json(
        { success: true, userId: (result as any).insertId },
        { status: 201 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}