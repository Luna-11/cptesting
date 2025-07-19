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

// GET dashboard overview data (admin only)
export async function GET(request: NextRequest) {
  try {
    validateAdminAuth(request);
    
    // Get overview statistics
    const [overviewStats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM user) as total_users,
        (SELECT COUNT(*) FROM user WHERE role_id = 3) as pro_users,
        (SELECT COUNT(*) FROM user WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_month,
        (SELECT COUNT(*) FROM calendar) as total_events,
        (SELECT COUNT(*) FROM todo_tasks) as total_tasks,
        (SELECT COUNT(*) FROM todo_tasks WHERE status = 'done') as completed_tasks,
        (SELECT COUNT(DISTINCT user_id) FROM calendar WHERE event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as active_users_week,
        (SELECT COUNT(*) * 29.99 FROM user WHERE role_id = 3) as monthly_revenue
    `);

    // Get recent user registrations
    const [recentUsers] = await db.query(`
      SELECT 
        user_id,
        name,
        email,
        role_id,
        created_at,
        CASE 
          WHEN role_id = 1 THEN 'Admin'
          WHEN role_id = 3 THEN 'Pro User'
          ELSE 'Regular User'
        END as role_name
      FROM user 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // Get system health metrics
    const [systemHealth] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM user WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)) as users_today,
        (SELECT COUNT(*) FROM calendar WHERE event_date >= CURDATE()) as events_today,
        (SELECT COUNT(*) FROM todo_tasks WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)) as tasks_today,
        (SELECT COUNT(DISTINCT user_id) FROM calendar WHERE event_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)) as active_users_today
    `);

    // Get user growth data for the last 30 days
    const [userGrowth] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM user 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Get top performing users
    const [topUsers] = await db.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        COUNT(DISTINCT c.event_id) as events,
        COUNT(DISTINCT t.task_id) as tasks,
        COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed_tasks,
        (COUNT(DISTINCT c.event_id) + COUNT(DISTINCT t.task_id)) as total_activity
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
      GROUP BY u.user_id
      HAVING total_activity > 0
      ORDER BY total_activity DESC
      LIMIT 5
    `);

    const dashboardData = {
      overview: Array.isArray(overviewStats) ? overviewStats[0] : overviewStats,
      recentUsers: Array.isArray(recentUsers) ? recentUsers : [],
      systemHealth: Array.isArray(systemHealth) ? systemHealth[0] : systemHealth,
      userGrowth: Array.isArray(userGrowth) ? userGrowth : [],
      topUsers: Array.isArray(topUsers) ? topUsers : [],
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json(dashboardData);
    
  } catch (error: any) {
    console.error('GET dashboard error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error.message
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}