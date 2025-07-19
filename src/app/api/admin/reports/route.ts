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
<<<<<<< HEAD
=======
    const format = searchParams.get('format') || 'json'; // json, csv
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201

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
<<<<<<< HEAD
            u.role_id,
            u.created_at,
            u.studyLevel,
            u.goal,
            COUNT(DISTINCT c.event_id) as total_events,
            COUNT(DISTINCT t.task_id) as total_tasks,
            MAX(c.event_date) as last_event,
            MAX(t.created_at) as last_task
=======
            CASE 
              WHEN u.role_id = 1 THEN 'Admin'
              WHEN u.role_id = 3 THEN 'Pro User'
              ELSE 'Regular User'
            END as role,
            u.created_at as join_date,
            u.studyLevel as study_level,
            u.goal as daily_study_goal,
            COUNT(DISTINCT c.event_id) as total_events,
            COUNT(DISTINCT t.task_id) as total_tasks,
            MAX(c.event_date) as last_event,
            MAX(t.created_at) as last_task,
            CASE 
              WHEN MAX(GREATEST(IFNULL(c.event_date, '1970-01-01'), IFNULL(t.created_at, '1970-01-01'))) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              THEN 'Active'
              WHEN MAX(GREATEST(IFNULL(c.event_date, '1970-01-01'), IFNULL(t.created_at, '1970-01-01'))) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              THEN 'Moderate'
              ELSE 'Inactive'
            END as activity_status,
            DATEDIFF(NOW(), u.created_at) as days_since_join
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
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
<<<<<<< HEAD
          generatedAt: new Date().toISOString()
=======
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
        });

      case 'activity':
        const [activityReport] = await db.query(`
          SELECT 
<<<<<<< HEAD
            'calendar' as activity_type,
            u.name as user_name,
            u.email as user_email,
            c.event_name as activity_name,
            c.event_date as activity_date,
            'event' as category
=======
            'calendar_event' as activity_type,
            u.name as user_name,
            u.email as user_email,
            CASE 
              WHEN u.role_id = 1 THEN 'Admin'
              WHEN u.role_id = 3 THEN 'Pro User'
              ELSE 'Regular User'
            END as user_role,
            c.event_name as activity_name,
            c.event_date as activity_date,
            'event_created' as category
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
          FROM calendar c
          JOIN user u ON c.user_id = u.user_id
          ${dateFilter.replace('created_at', 'c.event_date')}
          
          UNION ALL
          
          SELECT 
<<<<<<< HEAD
            'todo' as activity_type,
            u.name as user_name,
            u.email as user_email,
=======
            'todo_task' as activity_type,
            u.name as user_name,
            u.email as user_email,
            CASE 
              WHEN u.role_id = 1 THEN 'Admin'
              WHEN u.role_id = 3 THEN 'Pro User'
              ELSE 'Regular User'
            END as user_role,
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
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
<<<<<<< HEAD
          generatedAt: new Date().toISOString()
=======
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
        });

      case 'engagement':
        const [engagementReport] = await db.query(`
          SELECT 
            u.user_id,
            u.name,
            u.email,
<<<<<<< HEAD
            u.created_at as join_date,
=======
            CASE 
              WHEN u.role_id = 1 THEN 'Admin'
              WHEN u.role_id = 3 THEN 'Pro User'
              ELSE 'Regular User'
            END as role,
            u.created_at as join_date,
            u.goal as daily_study_goal,
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
            COUNT(DISTINCT c.event_id) as events_created,
            COUNT(DISTINCT t.task_id) as tasks_created,
            COUNT(DISTINCT DATE(c.event_date)) as active_days_calendar,
            COUNT(DISTINCT DATE(t.created_at)) as active_days_tasks,
<<<<<<< HEAD
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
=======
            COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.task_id END) as completed_tasks,
            DATEDIFF(CURDATE(), u.created_at) as days_since_join,
            CASE 
              WHEN MAX(c.event_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
                OR MAX(DATE(t.created_at)) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
              THEN 'Highly Active'
              WHEN MAX(c.event_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                OR MAX(DATE(t.created_at)) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              THEN 'Moderately Active'
              ELSE 'Inactive'
            END as engagement_level,
            ROUND(
              (COUNT(DISTINCT c.event_id) + COUNT(DISTINCT t.task_id)) / 
              GREATEST(DATEDIFF(CURDATE(), u.created_at), 1), 2
            ) as avg_activities_per_day
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
          ${dateFilter.replace('created_at', 'u.created_at')}
          GROUP BY u.user_id
<<<<<<< HEAD
          ORDER BY (COUNT(DISTINCT c.event_id) + COUNT(DISTINCT t.task_id)) DESC
=======
          ORDER BY avg_activities_per_day DESC, (COUNT(DISTINCT c.event_id) + COUNT(DISTINCT t.task_id)) DESC
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
        `, dateParams);
        
        return NextResponse.json({
          type: 'engagement',
          data: Array.isArray(engagementReport) ? engagementReport : [],
<<<<<<< HEAD
          generatedAt: new Date().toISOString()
=======
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
        });

      case 'subscription':
        const [subscriptionReport] = await db.query(`
          SELECT 
            u.user_id,
            u.name,
            u.email,
            CASE 
              WHEN u.role_id = 1 THEN 'Admin'
              WHEN u.role_id = 3 THEN 'Pro User'
              ELSE 'Regular User'
            END as subscription_type,
            u.created_at as join_date,
            CASE 
              WHEN u.role_id = 3 THEN 'Active'
              ELSE 'Free'
            END as subscription_status,
            CASE 
              WHEN u.role_id = 3 THEN 29.99
              ELSE 0.00
            END as monthly_revenue,
            COUNT(DISTINCT c.event_id) as total_events,
            COUNT(DISTINCT t.task_id) as total_tasks,
            DATEDIFF(NOW(), u.created_at) as customer_lifetime_days
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
          ${dateFilter.replace('created_at', 'u.created_at')}
          GROUP BY u.user_id
          ORDER BY monthly_revenue DESC, u.created_at DESC
        `, dateParams);
        
        return NextResponse.json({
          type: 'subscription',
          data: Array.isArray(subscriptionReport) ? subscriptionReport : [],
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
        });

      default: // summary
        const [summaryStats] = await db.query(`
          SELECT 
            COUNT(DISTINCT u.user_id) as total_users,
            COUNT(DISTINCT c.event_id) as total_events,
            COUNT(DISTINCT t.task_id) as total_tasks,
            COUNT(CASE WHEN u.role_id = 3 THEN 1 END) as pro_users,
<<<<<<< HEAD
            COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
            COUNT(CASE WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as events_7d,
            COUNT(CASE WHEN t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as tasks_7d
=======
            COUNT(CASE WHEN u.role_id = 1 THEN 1 END) as admin_users,
            COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
            COUNT(CASE WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_7d,
            COUNT(CASE WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as events_7d,
            COUNT(CASE WHEN t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as tasks_7d,
            COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed_tasks,
            SUM(CASE WHEN u.role_id = 3 THEN 29.99 ELSE 0 END) as monthly_revenue,
            COUNT(DISTINCT CASE 
              WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                OR t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              THEN u.user_id 
            END) as weekly_active_users,
            COUNT(DISTINCT CASE 
              WHEN c.event_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
                OR t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              THEN u.user_id 
            END) as monthly_active_users
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
        `);
<<<<<<< HEAD
        
        return NextResponse.json({
          type: 'summary',
          data: Array.isArray(summaryStats) ? summaryStats[0] : summaryStats,
          generatedAt: new Date().toISOString()
=======

        // Get growth trends
        const [growthTrends] = await db.query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users,
            COUNT(CASE WHEN role_id = 3 THEN 1 END) as new_pro_users
          FROM user 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `);
        
        const summaryData = Array.isArray(summaryStats) ? summaryStats[0] : summaryStats;
        const conversionRate = summaryData?.total_users > 0 ? 
          (summaryData.pro_users / summaryData.total_users * 100).toFixed(2) : '0.00';
        
        return NextResponse.json({
          type: 'summary',
          data: {
            ...summaryData,
            conversion_rate: parseFloat(conversionRate),
            growth_trends: Array.isArray(growthTrends) ? growthTrends : []
          },
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
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
<<<<<<< HEAD
=======
}

// POST generate custom report (admin only)
export async function POST(request: NextRequest) {
  try {
    validateAdminAuth(request);
    const body = await request.json();
    
    const { 
      reportName, 
      dateRange, 
      userFilters, 
      metrics, 
      groupBy 
    } = body;

    // Build custom query based on request parameters
    let query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.role_id,
        u.created_at
    `;

    // Add requested metrics
    if (metrics?.includes('events')) {
      query += `, COUNT(DISTINCT c.event_id) as total_events`;
    }
    if (metrics?.includes('tasks')) {
      query += `, COUNT(DISTINCT t.task_id) as total_tasks`;
    }
    if (metrics?.includes('completedTasks')) {
      query += `, COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed_tasks`;
    }

    query += `
      FROM user u
      LEFT JOIN calendar c ON u.user_id = c.user_id
      LEFT JOIN todo_tasks t ON u.user_id = t.user_id
    `;

    const queryParams: any[] = [];
    const whereConditions: string[] = [];

    // Add date filters
    if (dateRange?.start && dateRange?.end) {
      whereConditions.push('u.created_at BETWEEN ? AND ?');
      queryParams.push(dateRange.start, dateRange.end);
    }

    // Add user filters
    if (userFilters?.role) {
      whereConditions.push('u.role_id = ?');
      queryParams.push(userFilters.role);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` GROUP BY u.user_id`;

    // Add grouping
    if (groupBy) {
      query += ` ORDER BY ${groupBy}`;
    }

    const [customReport] = await db.query(query, queryParams);

    return NextResponse.json({
      type: 'custom',
      reportName,
      data: Array.isArray(customReport) ? customReport : [],
      parameters: { dateRange, userFilters, metrics, groupBy },
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('POST custom report error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate custom report',
        details: error.message
      },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
>>>>>>> 7cf14054d4f0b8f98280e88a62b3a6ad96cf2201
}