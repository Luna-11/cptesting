import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';
import bcrypt from 'bcrypt';

function validateAdminAuth(request: NextRequest) {
  const loggedIn = request.cookies.get('loggedIn')?.value;
  const userId = request.cookies.get('userId')?.value;
  const role = request.cookies.get('role')?.value;

  if (!loggedIn || loggedIn !== 'true' || !userId || role !== 'admin') {
    throw new Error('Unauthorized - Admin access required');
  }
  return { userId, role };
}

export async function GET(request: NextRequest) {
  try {
    validateAdminAuth(request);
    
    const { searchParams } = new URL(request.url);
    const analytics = searchParams.get('analytics');
    
    if (analytics === 'true') {
      // Analytics data request
      const [userStats] = await db.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role_id = 1 THEN 1 END) as admin_users,
          COUNT(CASE WHEN role_id = 2 THEN 1 END) as regular_users,
          COUNT(CASE WHEN role_id = 3 THEN 1 END) as pro_users
        FROM user
      `);

      const [activityStats] = await db.query(`
        SELECT 
          COUNT(DISTINCT c.user_id) as users_with_events,
          COUNT(c.event_id) as total_events,
          COUNT(DISTINCT t.user_id) as users_with_tasks,
          COUNT(t.task_id) as total_tasks
        FROM user u
        LEFT JOIN calendar c ON u.user_id = c.user_id
        LEFT JOIN todo_tasks t ON u.user_id = t.user_id
      `);

      const [engagementStats] = await db.query(`
        SELECT 
          COUNT(DISTINCT CASE 
            WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
              OR t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            THEN u.user_id 
          END) as weekly_active_users
        FROM user u
        LEFT JOIN calendar c ON u.user_id = c.user_id
        LEFT JOIN todo_tasks t ON u.user_id = t.user_id
      `);

      return NextResponse.json({
        success: true,
        data: {
          userStats: Array.isArray(userStats) ? userStats[0] : {},
          activityStats: Array.isArray(activityStats) ? activityStats[0] : {},
          engagementStats: Array.isArray(engagementStats) ? engagementStats[0] : {},
          generatedAt: new Date().toISOString()
        }
      });
    } else {
      // Regular users list request
      const search = searchParams.get('search') || '';
      const roleFilter = searchParams.get('role') || 'all';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (search) {
        whereClause += ' AND (u.name LIKE ? OR u.email LIKE ?)';
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (roleFilter !== 'all') {
        whereClause += ' AND u.role_id = ?';
        if (roleFilter === 'admin') {
          queryParams.push(1);
        } else if (roleFilter === 'pro') {
          queryParams.push(3);
        } else {
          queryParams.push(2);
        }
      }

      const [users] = await db.query(`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.role_id,
          u.goal,
          u.studyLevel
        FROM user u
        ${whereClause}
        ORDER BY u.user_id DESC
        LIMIT ? OFFSET ?
      `, [...queryParams, limit, offset]);

      const [countResult] = await db.query(`
        SELECT COUNT(*) as total
        FROM user u
        ${whereClause}
      `, queryParams);

      const total = Array.isArray(countResult) ? countResult[0]?.total || 0 : 0;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        data: {
          users: Array.isArray(users) ? users : [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    }
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack
        })
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// POST, PUT, DELETE handlers remain the same as previous implementation

// POST create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    validateAdminAuth(request);
    const body = await request.json();
    
    const { name, email, password, role_id, studyLevel, goal } = body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      'SELECT user_id FROM user WHERE email = ?',
      [email]
    );

    if ((existingUser as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result]: any = await db.query(
      `INSERT INTO user (name, email, password, role_id, studyLevel, goal) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role_id || 2, studyLevel || null, goal || null]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      userId: result.insertId 
    });

  } catch (error: any) {
    console.error('POST user error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
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
    
    const { userId, name, email, role_id, studyLevel, goal, password } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existingUser] = await db.query(
      'SELECT user_id FROM user WHERE user_id = ?',
      [userId]
    );

    if ((existingUser as any[]).length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (role_id !== undefined) {
      updateFields.push('role_id = ?');
      updateValues.push(role_id);
    }
    if (studyLevel !== undefined) {
      updateFields.push('studyLevel = ?');
      updateValues.push(studyLevel);
    }
    if (goal !== undefined) {
      updateFields.push('goal = ?');
      updateValues.push(goal);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(userId);

    const [result]: any = await db.query(
      `UPDATE user SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'User not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully' 
    });

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

    // Check if user exists
    const [existingUser] = await db.query(
      'SELECT user_id, role_id FROM user WHERE user_id = ?',
      [userId]
    );

    if ((existingUser as any[]).length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users (optional safety check)
    const user = (existingUser as any[])[0];
    if (user.role_id === 1) {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
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

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });

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