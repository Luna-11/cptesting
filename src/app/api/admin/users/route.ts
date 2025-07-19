import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';
<<<<<<< HEAD
=======
import bcrypt from 'bcrypt';
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201

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

<<<<<<< HEAD
// GET all users (admin only)
=======
// GET all users with detailed information (admin only)
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
export async function GET(request: NextRequest) {
  try {
    validateAdminAuth(request);
    
<<<<<<< HEAD
=======
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build WHERE clause for filtering
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];

    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
      // Map status to role_id or other criteria
      if (status === 'admin') {
        whereClause += ' AND u.role_id = ?';
        queryParams.push(1);
      } else if (status === 'pro') {
        whereClause += ' AND u.role_id = ?';
        queryParams.push(3);
      } else if (status === 'user') {
        whereClause += ' AND u.role_id = ?';
        queryParams.push(2);
      }
    }

    // Get users with aggregated data
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
    const [users] = await db.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.role_id,
        u.created_at,
<<<<<<< HEAD
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
=======
        u.goal as daily_study_goal,
        u.studyLevel as study_level,
        COUNT(DISTINCT c.event_id) as total_events,
        COUNT(DISTINCT t.task_id) as total_tasks,
        MAX(c.event_date) as last_event_date,
        MAX(t.created_at) as last_task_date,
        CASE 
          WHEN u.role_id = 1 THEN 'admin'
          WHEN u.role_id = 3 THEN 'pro'
          ELSE 'user'
        END as role,
        CASE 
          WHEN MAX(c.event_date) >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
            OR MAX(t.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          THEN 'active'
          WHEN MAX(c.event_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            OR MAX(t.created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          THEN 'inactive'
          ELSE 'dormant'
        END as status,
        DATEDIFF(NOW(), u.created_at) as days_since_join
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
      ${whereClause}
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Get total count for pagination
    const [countResult] = await db.query(`
      SELECT COUNT(DISTINCT u.user_id) as total
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
      ${whereClause}
    `, queryParams);

    const total = (countResult as any[])[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: Array.isArray(users) ? users : [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
    
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

<<<<<<< HEAD
=======
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

>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
// PUT update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    validateAdminAuth(request);
    const body = await request.json();
    
<<<<<<< HEAD
    const { userId, name, email, role_id, studyLevel, goal } = body;
=======
    const { userId, name, email, role_id, studyLevel, goal, password } = body;
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    const [result]: any = await db.query(
      `UPDATE user 
       SET name = ?, email = ?, role_id = ?, studyLevel = ?, goal = ?
       WHERE user_id = ?`,
      [name, email, role_id, studyLevel, goal, userId]
    );

    if (result.affectedRows === 0) {
=======
    // Check if user exists
    const [existingUser] = await db.query(
      'SELECT user_id FROM user WHERE user_id = ?',
      [userId]
    );

    if ((existingUser as any[]).length === 0) {
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

<<<<<<< HEAD
    return NextResponse.json({ success: true, message: 'User updated successfully' });
=======
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
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201

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

<<<<<<< HEAD
=======
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

>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
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

<<<<<<< HEAD
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
=======
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201

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