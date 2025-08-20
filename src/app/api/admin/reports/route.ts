import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

// Enhanced QueryResult type with proper type narrowing
type QueryResult<T extends RowDataPacket = RowDataPacket> = 
  T[] | OkPacket | ResultSetHeader;

// Type guard functions
function isRowDataPacketArray<T extends RowDataPacket>(result: unknown, prop: keyof T): result is T[] {
  return Array.isArray(result) && result.length > 0 && prop in result[0];
}

// Report interfaces extending RowDataPacket
interface UserReport extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  role: string;
  join_date: string;
  study_level: string;
  daily_study_goal: number;
  total_events: number;
  total_tasks: number;
  last_event: string;
  last_task: string;
  activity_status: string;
  days_since_join: number;
}

interface ActivityReport extends RowDataPacket {
  activity_type: string;
  user_name: string;
  user_email: string;
  user_role: string;
  activity_name: string;
  activity_date: string;
  category: string;
}

interface EngagementReport extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  role: string;
  join_date: string;
  daily_study_goal: number;
  events_created: number;
  tasks_created: number;
  active_days_calendar: number;
  active_days_tasks: number;
  completed_tasks: number;
  days_since_join: number;
  engagement_level: string;
  avg_activities_per_day: number;
}

interface SubscriptionReport extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  subscription_type: string;
  join_date: string;
  subscription_status: string;
  monthly_revenue: number;
  total_events: number;
  total_tasks: number;
  customer_lifetime_days: number;
}

interface SummaryStats extends RowDataPacket {
  total_users: number;
  total_events: number;
  total_tasks: number;
  pro_users: number;
  admin_users: number;
  new_users_30d: number;
  new_users_7d: number;
  events_7d: number;
  tasks_7d: number;
  completed_tasks: number;
  monthly_revenue: number;
  weekly_active_users: number;
  monthly_active_users: number;
}

interface GrowthTrend extends RowDataPacket {
  date: string;
  new_users: number;
  new_pro_users: number;
}

interface CustomReport extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
  created_at: string;
  total_events?: number;
  total_tasks?: number;
  completed_tasks?: number;
}

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
    const format = searchParams.get('format') || 'json';

    let dateFilter = '';
    let dateParams: any[] = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN ? AND ?';
      dateParams = [startDate, endDate];
    }

    switch (reportType) {
      case 'users': {
        const [usersResult] = await db.query<QueryResult<UserReport>>(`
          SELECT 
            u.user_id,
            u.name,
            u.email,
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
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
          ${dateFilter.replace('created_at', 'u.created_at')}
          GROUP BY u.user_id
          ORDER BY u.created_at DESC
        `, dateParams);

        if (!isRowDataPacketArray<UserReport>(usersResult, 'user_id')) {
          throw new Error('Invalid users report data format');
        }

        return NextResponse.json({
          type: 'users',
          data: usersResult,
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
        });
      }

      case 'activity': {
        const [activityResult] = await db.query<QueryResult<ActivityReport>>(`
          SELECT 
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
          FROM calendar c
          JOIN user u ON c.user_id = u.user_id
          ${dateFilter.replace('created_at', 'c.event_date')}
          
          UNION ALL
          
          SELECT 
            'todo_task' as activity_type,
            u.name as user_name,
            u.email as user_email,
            CASE 
              WHEN u.role_id = 1 THEN 'Admin'
              WHEN u.role_id = 3 THEN 'Pro User'
              ELSE 'Regular User'
            END as user_role,
            t.task_name as activity_name,
            t.created_at as activity_date,
            t.status as category
          FROM todo_tasks t
          JOIN user u ON t.user_id = u.user_id
          ${dateFilter.replace('created_at', 't.created_at')}
          
          ORDER BY activity_date DESC
        `, [...dateParams, ...dateParams]);

        if (!isRowDataPacketArray<ActivityReport>(activityResult, 'activity_type')) {
          throw new Error('Invalid activity report data format');
        }

        return NextResponse.json({
          type: 'activity',
          data: activityResult,
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
        });
      }

      case 'engagement': {
        const [engagementResult] = await db.query<QueryResult<EngagementReport>>(`
          SELECT 
            u.user_id,
            u.name,
            u.email,
            CASE 
              WHEN u.role_id = 1 THEN 'Admin'
              WHEN u.role_id = 3 THEN 'Pro User'
              ELSE 'Regular User'
            END as role,
            u.created_at as join_date,
            u.goal as daily_study_goal,
            COUNT(DISTINCT c.event_id) as events_created,
            COUNT(DISTINCT t.task_id) as tasks_created,
            COUNT(DISTINCT DATE(c.event_date)) as active_days_calendar,
            COUNT(DISTINCT DATE(t.created_at)) as active_days_tasks,
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
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
          ${dateFilter.replace('created_at', 'u.created_at')}
          GROUP BY u.user_id
          ORDER BY avg_activities_per_day DESC, (COUNT(DISTINCT c.event_id) + COUNT(DISTINCT t.task_id)) DESC
        `, dateParams);

        if (!isRowDataPacketArray<EngagementReport>(engagementResult, 'user_id')) {
          throw new Error('Invalid engagement report data format');
        }

        return NextResponse.json({
          type: 'engagement',
          data: engagementResult,
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
        });
      }

      case 'subscription': {
        const [subscriptionResult] = await db.query<QueryResult<SubscriptionReport>>(`
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

        if (!isRowDataPacketArray<SubscriptionReport>(subscriptionResult, 'user_id')) {
          throw new Error('Invalid subscription report data format');
        }

        return NextResponse.json({
          type: 'subscription',
          data: subscriptionResult,
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
        });
      }

      default: { // summary
        const [summaryResult] = await db.query<QueryResult<SummaryStats>>(`
          SELECT 
            COUNT(DISTINCT u.user_id) as total_users,
            COUNT(DISTINCT c.event_id) as total_events,
            COUNT(DISTINCT t.task_id) as total_tasks,
            COUNT(CASE WHEN u.role_id = 3 THEN 1 END) as pro_users,
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
          FROM user u
          LEFT JOIN calendar c ON u.user_id = c.user_id
          LEFT JOIN todo_tasks t ON u.user_id = t.user_id
        `);

        const [growthTrends] = await db.query<QueryResult<GrowthTrend>>(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users,
            COUNT(CASE WHEN role_id = 3 THEN 1 END) as new_pro_users
          FROM user 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `);

        if (!isRowDataPacketArray<SummaryStats>(summaryResult, 'total_users')) {
          throw new Error('Invalid summary stats data format');
        }

        if (!isRowDataPacketArray<GrowthTrend>(growthTrends, 'date')) {
          throw new Error('Invalid growth trends data format');
        }

        const summaryData = summaryResult[0];
        const conversionRate = summaryData.total_users > 0 ? 
          (summaryData.pro_users / summaryData.total_users * 100).toFixed(2) : '0.00';
        
        return NextResponse.json({
          type: 'summary',
          data: {
            ...summaryData,
            conversion_rate: parseFloat(conversionRate),
            growth_trends: growthTrends
          },
          generatedAt: new Date().toISOString(),
          filters: { startDate, endDate }
        });
      }
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

    const [customResult] = await db.query<QueryResult<CustomReport>>(query, queryParams);

    if (!isRowDataPacketArray<CustomReport>(customResult, 'user_id')) {
      throw new Error('Invalid custom report data format');
    }

    return NextResponse.json({
      type: 'custom',
      reportName,
      data: customResult,
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
}