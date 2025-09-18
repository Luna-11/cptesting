import { NextRequest, NextResponse } from "next/server";
import { db } from "@script/db";
import { cookies } from "next/headers";

// ---------- Helpers ----------

// Myanmar timezone offset (+6h30m = 390 minutes)
const MYANMAR_OFFSET_MINUTES = 390;

function toMyanmarDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + MYANMAR_OFFSET_MINUTES * 60000);
}

function toMyanmarDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calculateCurrentStreak(loginDates: string[]): number {
  if (loginDates.length === 0) return 0;

  // Sort dates in descending order (newest first)
  const sorted = [...loginDates].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  let streak = 1;
  
  // If the most recent login is not today, streak is 0
  const today = toMyanmarDateString(toMyanmarDate());
  if (sorted[0] !== today) {
    return 0;
  }

  // Check consecutive days
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1]);
    const currentDate = new Date(sorted[i]);
    
    // Calculate difference in days
    const diffTime = prevDate.getTime() - currentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(loginDates: string[]): number {
  if (loginDates.length === 0) return 0;
  
  // Sort dates in ascending order (oldest first)
  const sorted = [...loginDates].sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  let longestStreak = 0;
  let currentStreak = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i-1]);
    const currDate = new Date(sorted[i]);
    
    // Calculate difference in days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
    } else if (diffDays > 1) {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  
  return Math.max(longestStreak, currentStreak);
}

async function getUserId(req: NextRequest): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const idStr = cookieStore.get("userId")?.value || req.nextUrl.searchParams.get("userId");
    if (!idStr) return null;
    const id = parseInt(idStr, 10);
    return isNaN(id) ? null : id;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

// ---------- POST /api/streak ----------
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Please log in" }, { status: 401 });
    }

    const today = toMyanmarDateString(toMyanmarDate());

    // Check if already logged in today
    const [existing] = await db.execute(
      "SELECT id FROM login_streaks WHERE user_id = ? AND login_date = ?",
      [userId, today]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      const [rows] = await db.execute(
        "SELECT login_date FROM login_streaks WHERE user_id = ? ORDER BY login_date DESC",
        [userId]
      );

      const loginDates = Array.isArray(rows) ? rows.map((r: any) => 
        typeof r.login_date === 'string' ? r.login_date : r.login_date.toISOString().split('T')[0]
      ) : [];

      return NextResponse.json({
        success: true,
        message: "Already logged in today",
        currentStreak: calculateCurrentStreak(loginDates),
        longestStreak: calculateLongestStreak(loginDates),
        lastLoginDate: today,
      });
    }

    // Insert today
    await db.execute(
      "INSERT INTO login_streaks (user_id, login_date) VALUES (?, ?)", 
      [userId, today]
    );

    const [rows] = await db.execute(
      "SELECT login_date FROM login_streaks WHERE user_id = ? ORDER BY login_date DESC",
      [userId]
    );
    
    const loginDates = Array.isArray(rows) ? rows.map((r: any) => 
      typeof r.login_date === 'string' ? r.login_date : r.login_date.toISOString().split('T')[0]
    ) : [];

    return NextResponse.json({
      success: true,
      message: "Login recorded successfully",
      currentStreak: calculateCurrentStreak(loginDates),
      longestStreak: calculateLongestStreak(loginDates),
      lastLoginDate: today,
    });
  } catch (error) {
    console.error("Error recording login:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ---------- GET /api/streak ----------
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Please log in" }, { status: 401 });
    }

    // Get current Myanmar date
    const nowMyanmar = toMyanmarDate();
    const yearMyanmar = nowMyanmar.getFullYear();
    const monthMyanmar = nowMyanmar.getMonth() + 1;

    // Get all login dates for the user
    const [allRows] = await db.execute(
      "SELECT login_date FROM login_streaks WHERE user_id = ? ORDER BY login_date DESC",
      [userId]
    );
    
    // Convert all dates to Myanmar timezone for processing
    const loginDates = Array.isArray(allRows) ? allRows.map((r: any) => {
      let date;
      if (typeof r.login_date === 'string') {
        date = new Date(r.login_date);
      } else if (r.login_date instanceof Date) {
        date = r.login_date;
      } else {
        date = new Date(r.login_date);
      }
      
      // Convert to Myanmar timezone
      return toMyanmarDateString(date);
    }) : [];

    // Filter for current month (Myanmar time)
    const loginHistory: Record<string, boolean> = {};
    loginDates.forEach(dateStr => {
      const date = new Date(dateStr);
      if (date.getFullYear() === yearMyanmar && date.getMonth() + 1 === monthMyanmar) {
        loginHistory[dateStr] = true;
      }
    });

    return NextResponse.json({
      success: true,
      currentStreak: calculateCurrentStreak(loginDates),
      longestStreak: calculateLongestStreak(loginDates),
      loginHistory,
      allDates: loginDates
    });
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}