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

// GET analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    validateAdminAuth(request);
    
    // Get user statistics
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role_id = 1 THEN 1 END) as admin_users,
        COUNT(CASE WHEN role_id = 2 THEN 1 END) as regular_users,
        COUNT(CASE WHEN role_id = 3 THEN 1 END) as pro_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_7d
      FROM user
    `);

    // Get activity statistics
    const [activityStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT c.user_id) as users_with_events,
        COUNT(c.event_id) as total_events,
        COUNT(DISTINCT t.user_id) as users_with_tasks,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN c.event_date >= CURDATE() - INTERVAL 7 DAY THEN 1 END) as events_last_week,
        COUNT(CASE WHEN t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as tasks_last_week
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
    `);

    // Get recent activity
    const [recentActivity] = await db.query(`
      SELECT 
        'event' as type,
        u.name as user_name,
        c.event_name as activity,
        c.event_date as timestamp
      FROM calendar c
      JOIN user u ON c.user_id = u.user_id
      WHERE c.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'task' as type,
        u.name as user_name,
        t.task_name as activity,
        t.created_at as timestamp
      FROM todo_tasks t
      JOIN user u ON t.user_id = u.user_id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY timestamp DESC
      LIMIT 20
    `);

    // Get user engagement data
    const [engagementData] = await db.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.created_at,
        COUNT(DISTINCT c.event_id) as total_events,
        COUNT(DISTINCT t.task_id) as total_tasks,
        MAX(c.event_date) as last_event_date,
        MAX(t.created_at) as last_task_date
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
      GROUP BY u.user_id
      ORDER BY (COUNT(DISTINCT c.event_id) + COUNT(DISTINCT t.task_id)) DESC
    `);

    const analytics = {
      userStats: Array.isArray(userStats) ? userStats[0] : userStats,
      activityStats: Array.isArray(activityStats) ? activityStats[0] : activityStats,
      recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
      engagementData: Array.isArray(engagementData) ? engagementData : []
    };
    
    return NextResponse.json(analytics);
    
  } catch (error: any) {
    console.error('GET analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        details: error.message
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}