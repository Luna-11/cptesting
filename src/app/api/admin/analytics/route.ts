import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';
import type { RowDataPacket } from 'mysql2';

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

    // Count users by role
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        COUNT(CASE WHEN role_id != 2 THEN 1 END) as total_users, -- exclude role_id=2
        COUNT(CASE WHEN role_id = 1 THEN 1 END) as admin_users,
        COUNT(CASE WHEN role_id = 2 THEN 1 END) as regular_users,
        COUNT(CASE WHEN role_id = 3 THEN 1 END) as pro_users
      FROM user
    `);

    const stats = rows[0] || {
      total_users: 0,
      admin_users: 0,
      regular_users: 0,
      pro_users: 0,
    };

    return NextResponse.json({
      status: 'success',
      data: {
        userStats: {
          total_users: stats.total_users,   // excludes role_id=2
          admin_users: stats.admin_users,
          regular_users: stats.regular_users,
          pro_users: stats.pro_users,
          monthly_revenue: 0,
        },
        engagementStats: {
          daily_active_users: 0,
          weekly_active_users: 0,
          monthly_active_users: 0,
          total_events: 0,
          events_today: 0,
          events_last_week: 0,
          total_tasks: 0,
          tasks_today: 0,
          tasks_last_week: 0,
          users_with_events: 0,
          users_with_tasks: 0,
        },
        recentActivity: [],
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('GET engagement analytics error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch engagement analytics',
        details: error.message,
      },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
