import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';

// Enhanced cookie validation for admin
function validateAdminAuth(request: NextRequest) {
  const loggedIn = request.cookies.get('loggedIn')?.value;
  const userId = request.cookies.get('userId')?.value;
  const role = request.cookies.get('role')?.value;

  if (!loggedIn || loggedIn !== 'true' || !userId || role !== 'admin') {
    throw new Error('Unauthorized - Admin access required');
  }

  return { userId, role };
}

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    validateAdminAuth(request);
    
    const [users] = await db.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.role_id,
        u.created_at,
        u.goal,
        u.studyLevel,
        COUNT(DISTINCT c.event_id) as total_events,
        COUNT(DISTINCT t.task_id) as total_tasks
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
    `);
    
    return NextResponse.json(Array.isArray(users) ? users : []);
    
  } catch (error: any) {
    console.error('GET users error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error.message
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// PUT update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    validateAdminAuth(request);
    const body = await request.json();
    
    const { userId, name, email, role_id, studyLevel, goal } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `UPDATE user 
       SET name = ?, email = ?, role_id = ?, studyLevel = ?, goal = ?
       WHERE user_id = ?`,
      [name, email, role_id, studyLevel, goal, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });

  } catch (error: any) {
    console.error('PUT user error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user',
        details: error.message
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    validateAdminAuth(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete user and related data (cascade)
    await db.query('DELETE FROM calendar WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM todo_tasks WHERE user_id = ?', [userId]);
    const [result]: any = await db.query('DELETE FROM user WHERE user_id = ?', [userId]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });

  } catch (error: any) {
    console.error('DELETE user error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: error.message
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}