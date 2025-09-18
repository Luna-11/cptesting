import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mysql from 'mysql2/promise';

export async function GET() {

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'studywithme'
  });

  try {
    const [users] = await connection.execute(
      'SELECT user_id, name, email, goal, studyLevel, role_id FROM user WHERE email = ?',
  
    );

    const user = (users as any[])[0];
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role_id === 1 ? 'admin' : 'user',
      goal: user.goal,
      studyLevel: user.studyLevel
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}