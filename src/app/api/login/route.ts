import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'studywithme'
    });

    try {
      const [users] = await connection.execute(
        'SELECT user_id, name, email, password, role_id FROM user WHERE name = ? OR email = ?',
        [username.trim(), username.trim()]
      );

      const user = (users as any[])[0];

      if (!user) {
        return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
      }

      const roles: Record<number, string> = {
        1: 'admin',
        2: 'user',
        3: 'pro_user'
      };

      const role = user.role_id in roles ? roles[user.role_id] : 'user';

      const response = NextResponse.json({
        success: true,
        role,
        userId: user.user_id,
        username: user.name
      });

      // Set both 'loggedIn' and 'role' cookies
response.cookies.set('loggedIn', 'true', {
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 24,
});

response.cookies.set('role', role, {
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 24,
});


      return response;

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
