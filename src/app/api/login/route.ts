import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  try {
    // Validate content type
    if (req.headers.get('content-type') !== 'application/json') {
      return NextResponse.json(
        { success: false, message: 'Unsupported content type' },
        { status: 415 }
      );
    }

    const { username, password } = await req.json();
    
    // Input validation
    if (!username?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    console.log('Login attempt:', { username });

    // Database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'studywithme'
    });

    try {
      // Query user from database
      const [users] = await connection.execute(
        'SELECT user_id, name, email, password, role_id FROM user WHERE name = ? OR email = ?',
        [username.trim(), username.trim()]
      );

      const user = (users as any[])[0];

      if (!user) {
        console.warn('Login failed - User not found');
        return NextResponse.json(
          { success: false, message: 'Invalid username or password' },
          { status: 401 }
        );
      }

      // Compare hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (passwordMatch) {
        console.log('Login successful:', user.name);
        
        // Map role_id to role name (expand as needed)
        const roles: Record<number, string> = {
          1: 'admin',
          2: 'user',
          3: 'pro_user' // example additional role
        };
        
        const role = user.role_id in roles ? roles[user.role_id] : 'user';

        // In a real app, you would create a session or JWT token here
        return NextResponse.json({ 
          success: true, 
          role,
          userId: user.user_id,
          username: user.name
        });
      }

      console.warn('Login failed - Invalid password');
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}