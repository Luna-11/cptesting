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

    // ✅ Monthly revenue for current month (already in your code)
    const [paymentRows] = await db.query<RowDataPacket[]>(`
      SELECT 
        COALESCE(SUM(amount), 0) AS monthly_revenue
      FROM user_payments
      WHERE status = 'Approved'
        AND MONTH(payment_date) = MONTH(CURRENT_DATE())
        AND YEAR(payment_date) = YEAR(CURRENT_DATE())
    `);

    const paymentStats = paymentRows[0] || { monthly_revenue: 0 };

    // ✅ Count users by role
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        COUNT(CASE WHEN role_id != 2 THEN 1 END) as total_users,
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

    // ✅ Purchases grouped by month
    const [purchaseRows] = await db.query<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') AS month,
        SUM(months) AS total_months_purchased,
        COUNT(payment_id) AS total_transactions,
        SUM(amount) AS total_revenue
      FROM user_payments
      WHERE status = 'Approved'
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month ASC;
    `);

    return NextResponse.json({
      status: 'success',
      data: {
        userStats: {
          total_users: stats.total_users,
          admin_users: stats.admin_users,
          regular_users: stats.regular_users,
          pro_users: stats.pro_users,
          monthly_revenue: paymentStats.monthly_revenue,
          conversion_rate: stats.total_users > 0 
            ? ((stats.pro_users / stats.total_users) * 100).toFixed(2) 
            : 0,
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
          // ✅ New monthly purchase stats
          monthlyPurchases: purchaseRows,
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

