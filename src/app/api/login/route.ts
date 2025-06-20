import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    console.log('Login attempt:', { username, password });

    const users = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user1', password: 'user123', role: 'user' },
    ];

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      console.log('Login successful:', user);
      return NextResponse.json({ success: true, role: user.role });
    }

    console.warn('Login failed - Invalid credentials');
    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request format' },
      { status: 400 }
    );
  }
}
