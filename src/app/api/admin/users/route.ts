// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';
import type { RowDataPacket } from 'mysql2';
import type { ResultSetHeader } from 'mysql2';

interface UserRow extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  password: string;
  goal: number | null;
  studyLevel: string | null;
  role_id: number;
}
interface UpdateUserRequest {
  userId: number;
  role?: 'user' | 'pro' | 'admin';
  status?: 'active' | 'inactive' | 'dormant';
}

export async function GET(request: NextRequest) {
  try {
    // Validate admin auth
    const loggedIn = request.cookies.get('loggedIn')?.value;
    const userId = request.cookies.get('userId')?.value;
    const role = request.cookies.get('role')?.value;

    if (!loggedIn || loggedIn !== 'true' || !userId || role !== 'admin') {
      throw new Error('Unauthorized - Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    // Get total count
    const [countRows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM user WHERE role_id != 1`
    );
    const total = countRows[0]?.count || 0;

    // Get paginated users - removed created_at from SELECT
    const [userRows] = await db.query<UserRow[]>(
      `SELECT 
        user_id, 
        name, 
        email, 
        role_id, 
        goal, 
        studyLevel
       FROM user
       WHERE role_id != 1
       ${search ? `AND (name LIKE ? OR email LIKE ?)` : ''}
       ORDER BY user_id DESC
       LIMIT ? OFFSET ?`,
      search ? [`%${search}%`, `%${search}%`, limit, offset] : [limit, offset]
    );

    // Transform data - using current date for join_date since created_at isn't available
    const users = userRows.map(user => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role_id === 3 ? 'pro' : 'user',
      role_id: user.role_id,
      status: 'active',
      last_event_date: '',
      last_task_date: '',
      total_events: 0,
      total_tasks: 0,
      study_level: user.studyLevel || '',
      daily_study_goal: user.goal || 0
    }));

    return NextResponse.json({
      status: 'success',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasPrev: page > 1,
          hasNext: page < Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Failed to fetch users',
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate admin auth
    const loggedIn = request.cookies.get('loggedIn')?.value;
    const userId = request.cookies.get('userId')?.value;
    const role = request.cookies.get('role')?.value;

    if (!loggedIn || loggedIn !== 'true' || !userId || role !== 'admin') {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Unauthorized - Admin access required',
        },
        { status: 403 }
      );
    }

    const body: UpdateUserRequest = await request.json();
    const { userId: targetUserId, role: newRole, status } = body;

    if (!targetUserId) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Prepare update fields
    const updates: string[] = [];
    const params: any[] = [];

    if (newRole) {
      const roleId = newRole === 'admin' ? 1 : newRole === 'pro' ? 3 : 2;
      updates.push('role_id = ?');
      params.push(roleId);
    }

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'No valid updates provided',
        },
        { status: 400 }
      );
    }

    params.push(targetUserId);

    // Update user
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE user SET ${updates.join(', ')} WHERE user_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'User not found or no changes made',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'User updated successfully',
    });

  } catch (error: any) {
    console.error('Error in PUT /api/admin/users:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Failed to update user',
      },
      { status: 500 }
    );
  }
}

// Add DELETE method
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin auth
    const loggedIn = request.cookies.get('loggedIn')?.value;
    const userId = request.cookies.get('userId')?.value;
    const role = request.cookies.get('role')?.value;

    if (!loggedIn || loggedIn !== 'true' || !userId || role !== 'admin') {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Unauthorized - Admin access required',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (parseInt(targetUserId) === parseInt(userId)) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Cannot delete your own account',
        },
        { status: 400 }
      );
    }

    // Delete user from database
    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM user WHERE user_id = ?',
      [targetUserId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'User deleted successfully',
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/users:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}