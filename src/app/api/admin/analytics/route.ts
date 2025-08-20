import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';

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
    
    // Get basic user statistics (without time-based metrics)
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role_id = 1 THEN 1 END) as admin_users,
        COUNT(CASE WHEN role_id = 2 THEN 1 END) as regular_users,
        COUNT(CASE WHEN role_id = 3 THEN 1 END) as pro_users
      FROM user
    `);

    // Get activity statistics (using calendar and tasks dates only)
    const [activityStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT c.user_id) as users_with_events,
        COUNT(c.event_id) as total_events,
        COUNT(DISTINCT t.user_id) as users_with_tasks,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN c.event_date >= CURDATE() - INTERVAL 7 DAY THEN 1 END) as events_last_week,
        COUNT(CASE WHEN t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as tasks_last_week,
        COUNT(CASE WHEN c.event_date >= CURDATE() - INTERVAL 1 DAY THEN 1 END) as events_today,
        COUNT(CASE WHEN t.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END) as tasks_today
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
    `);

    // Get engagement metrics (using activity dates only)
    const [engagementStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT CASE 
          WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
            OR t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          THEN u.user_id 
        END) as weekly_active_users,
        COUNT(DISTINCT CASE 
          WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
            OR t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          THEN u.user_id 
        END) as monthly_active_users,
        COUNT(DISTINCT CASE 
          WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 1 DAY) 
            OR t.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          THEN u.user_id 
        END) as daily_active_users,
        AVG(CASE WHEN u.goal IS NOT NULL THEN u.goal END) as avg_study_goal
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
    `);

    // Get recent activity (last 20 activities)
    const [recentActivity] = await db.query(`
      SELECT 
        'event' as type,
        u.name as user_name,
        u.email as user_email,
        c.event_name as activity,
        c.event_date as timestamp,
        'calendar' as category
      FROM calendar c
      JOIN user u ON c.user_id = u.user_id
      WHERE c.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'task' as type,
        u.name as user_name,
        u.email as user_email,
        t.task_name as activity,
        t.created_at as timestamp,
        t.status as category
      FROM todo_tasks t
      JOIN user u ON t.user_id = u.user_id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY timestamp DESC
      LIMIT 20
    `);

    // Get top active users (without registration date)
    const [topUsers] = await db.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.role_id,
        COUNT(DISTINCT c.event_id) as total_events,
        COUNT(DISTINCT t.task_id) as total_tasks,
        (COUNT(DISTINCT c.event_id) + COUNT(DISTINCT t.task_id)) as activity_score,
        MAX(GREATEST(IFNULL(c.event_date, '1970-01-01'), IFNULL(t.created_at, '1970-01-01'))) as last_activity
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
      GROUP BY u.user_id
      HAVING activity_score > 0
      ORDER BY activity_score DESC, last_activity DESC
      LIMIT 10
    `);

    // Calculate subscription metrics
    const totalUsers = (userStats as any[])[0]?.total_users || 0;
    const proUsers = (userStats as any[])[0]?.pro_users || 0;
    const conversionRate = totalUsers > 0 ? (proUsers / totalUsers * 100) : 0;
    const monthlyRevenue = proUsers * 29.99; // Assuming $29.99 per pro user

    const analytics = {
      userStats: {
        ...(Array.isArray(userStats) ? userStats[0] : userStats),
        conversion_rate: conversionRate,
        monthly_revenue: monthlyRevenue
      },
      activityStats: Array.isArray(activityStats) ? activityStats[0] : activityStats,
      engagementStats: Array.isArray(engagementStats) ? engagementStats[0] : engagementStats,
      recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
      topUsers: Array.isArray(topUsers) ? topUsers : [],
      generatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(analytics);
    
  } catch (error: any) {
    console.error('GET analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        details: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          sqlError: error.code,
          sqlMessage: error.sqlMessage
        })
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}