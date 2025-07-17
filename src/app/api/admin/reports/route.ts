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

// GET reports data (admin only)
export async function GET(request: NextRequest) {
  try {
    validateAdminAuth(request);
    
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter = '';
    let dateParams: any[] = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN ? AND ?';
      dateParams = [startDate, endDate];
    }

    switch (reportType) {
      case 'users':
        const [usersReport] = await db.query(`
          SELECT 
            u.user_id,
            u.name,
            u.email,
            u.role_id,
            u.created_at,
            u.studyLevel,
            u.goal,
            COUNT(DISTINCT c.event_id) as total_events,
            COUNT(DISTINCT t.task_id) as total_tasks,
            MAX(c.event_date) as last_event,
            MAX(t.created_at) as last_task
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
          ${dateFilter.replace('created_at', 'u.created_at')}
          GROUP BY u.user_id
          ORDER BY u.created_at DESC
        `, dateParams);
        
        return NextResponse.json({
          type: 'users',
          data: Array.isArray(usersReport) ? usersReport : [],
          generatedAt: new Date().toISOString()
        });

      case 'activity':
        const [activityReport] = await db.query(`
          SELECT 
            'calendar' as activity_type,
            u.name as user_name,
            u.email as user_email,
            c.event_name as activity_name,
            c.event_date as activity_date,
            'event' as category
          FROM calendar c
          JOIN user u ON c.user_id = u.user_id
          ${dateFilter.replace('created_at', 'c.event_date')}
          
          UNION ALL
          
          SELECT 
            'todo' as activity_type,
            u.name as user_name,
            u.email as user_email,
            t.task_name as activity_name,
            t.created_at as activity_date,
            t.status as category
          FROM todo_tasks t
          JOIN user u ON t.user_id = u.user_id
          ${dateFilter.replace('created_at', 't.created_at')}
          
          ORDER BY activity_date DESC
        `, [...dateParams, ...dateParams]);
        
        return NextResponse.json({
          type: 'activity',
          data: Array.isArray(activityReport) ? activityReport : [],
          generatedAt: new Date().toISOString()
        });

      case 'engagement':
        const [engagementReport] = await db.query(`
          SELECT 
            u.user_id,
            u.name,
            u.email,
            u.created_at as join_date,
            COUNT(DISTINCT c.event_id) as events_created,
            COUNT(DISTINCT t.task_id) as tasks_created,
            COUNT(DISTINCT DATE(c.event_date)) as active_days_calendar,
            COUNT(DISTINCT DATE(t.created_at)) as active_days_tasks,
            DATEDIFF(CURDATE(), u.created_at) as days_since_join,
            CASE 
              WHEN MAX(c.event_date) > DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
                OR MAX(DATE(t.created_at)) > DATE_SUB(CURDATE(), INTERVAL 7 DAY)
              THEN 'Active'
              WHEN MAX(c.event_date) > DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                OR MAX(DATE(t.created_at)) > DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              THEN 'Moderate'
              ELSE 'Inactive'
            END as engagement_level
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
          ${dateFilter.replace('created_at', 'u.created_at')}
          GROUP BY u.user_id
          ORDER BY (COUNT(DISTINCT c.event_id) + COUNT(DISTINCT t.task_id)) DESC
        `, dateParams);
        
        return NextResponse.json({
          type: 'engagement',
          data: Array.isArray(engagementReport) ? engagementReport : [],
          generatedAt: new Date().toISOString()
        });

      default: // summary
        const [summaryStats] = await db.query(`
          SELECT 
            COUNT(DISTINCT u.user_id) as total_users,
            COUNT(DISTINCT c.event_id) as total_events,
            COUNT(DISTINCT t.task_id) as total_tasks,
            COUNT(CASE WHEN u.role_id = 3 THEN 1 END) as pro_users,
            COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
            COUNT(CASE WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as events_7d,
            COUNT(CASE WHEN t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as tasks_7d
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
        `);
        
        return NextResponse.json({
          type: 'summary',
          data: Array.isArray(summaryStats) ? summaryStats[0] : summaryStats,
          generatedAt: new Date().toISOString()
        });
    }
    
  } catch (error: any) {
    console.error('GET reports error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate report',
        details: error.message
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}