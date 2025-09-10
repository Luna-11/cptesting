import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@script/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    try {
      const [users] = await db.execute(
        'SELECT user_id, name, email, password, role_id FROM user WHERE name = ? OR email = ?',
        [username.trim(), username.trim()]
      );

      const user = (users as any[])[0];

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Role mapping
      const roleMap: Record<number, string> = {
        1: 'admin',
        3: 'pro'
      };
      const userRole = roleMap[user.role_id] || 'user';

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.user_id,
          name: user.name,
          role: userRole
        }
      });

      // Cookie expiration: 1 day (24 hours)
      const oneDay = 24 * 60 * 60; // in seconds

      // Set cookies
      response.cookies.set('loggedIn', 'true', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: oneDay
      });

      response.cookies.set('userId', user.user_id.toString(), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: oneDay
      });

      response.cookies.set('role', userRole, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: oneDay
      });

      return response;
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Cannot query database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}