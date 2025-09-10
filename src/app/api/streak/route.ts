import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';

// Define types
interface LoginData {
  [key: string]: boolean;
}

// Streak calculation function with proper typing
const calculateStreak = (loginDates: string[]): number => {
  if (loginDates.length === 0) return 0;
  
  // Sort dates in descending order
  const sortedDates = [...loginDates].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const loginDate = new Date(sortedDates[i]);
    loginDate.setHours(0, 0, 0, 0);
    
    const diffTime = currentDate.getTime() - loginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === i) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// POST /api/streak - Record a login and return streak data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if user already logged in today
    const [existingLogins] = await db.execute(
      'SELECT * FROM login_streaks WHERE user_id = ? AND login_date = ?',
      [userId, today]
    );

    const existingLoginsArray = existingLogins as any[];
    
    if (existingLoginsArray.length > 0) {
      // Get current streak count
      const [allLogins] = await db.execute(
        'SELECT login_date FROM login_streaks WHERE user_id = ? ORDER BY login_date DESC',
        [userId]
      );

      const loginDates = (allLogins as any[]).map(row => row.login_date);
      const currentStreak = calculateStreak(loginDates);

      return NextResponse.json({
        success: true,
        message: 'Already logged in today',
        currentStreak,
        lastLoginDate: today
      });
    }

    // Record new login
    await db.execute(
      'INSERT INTO login_streaks (user_id, login_date) VALUES (?, ?)',
      [userId, today]
    );

    // Get updated streak count
    const [allLogins] = await db.execute(
      'SELECT login_date FROM login_streaks WHERE user_id = ? ORDER BY login_date DESC',
      [userId]
    );

    const loginDates = (allLogins as any[]).map(row => row.login_date);
    const currentStreak = calculateStreak(loginDates);

    return NextResponse.json({
      success: true,
      message: 'Login recorded successfully',
      currentStreak,
      lastLoginDate: today
    });
  } catch (error) {
    console.error('Error recording login:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get login history for current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [monthLogins] = await db.execute(
      `SELECT login_date 
       FROM login_streaks 
       WHERE user_id = ? 
         AND YEAR(login_date) = ? 
         AND MONTH(login_date) = ?
       ORDER BY login_date`,
      [userId, year, month]
    );

    const loginHistory: LoginData = {};
    (monthLogins as any[]).forEach(row => {
      loginHistory[row.login_date] = true;
    });

    // Get current streak
    const [allLogins] = await db.execute(
      'SELECT login_date FROM login_streaks WHERE user_id = ? ORDER BY login_date DESC',
      [userId]
    );

    const loginDates = (allLogins as any[]).map(row => row.login_date);
    const currentStreak = calculateStreak(loginDates);

    return NextResponse.json({
      success: true,
      currentStreak,
      loginHistory
    });
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}