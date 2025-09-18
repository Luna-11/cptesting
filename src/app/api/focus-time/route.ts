// app/api/focus-time/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@script/db";

export const dynamic = 'force-dynamic';

// Enhanced cookie validation
function validateAuthCookies(request: NextRequest) {
  const loggedIn = request.cookies.get('loggedIn')?.value;
  const userId = request.cookies.get('userId')?.value;
  const role = request.cookies.get('role')?.value;

  if (!loggedIn || loggedIn !== 'true' || !userId) {
    throw new Error('Unauthorized - Invalid or missing authentication cookies');
  }

  return { userId, role };
}

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { userId } = validateAuthCookies(request);
    const body = await request.json();
    const { focus_duration_seconds } = body;
    
    // Basic validation
    if (focus_duration_seconds === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: focus_duration_seconds' },
        { status: 400 }
      );
    }
    
    // Additional validation
    if (typeof focus_duration_seconds !== 'number' || focus_duration_seconds <= 0) {
      return NextResponse.json(
        { error: 'focus_duration_seconds must be a positive number greater than 0' },
        { status: 400 }
      );
    }
    
    connection = await db.getConnection();
    
    // Insert into database with user authentication
    const [result]: any = await connection.execute(
      `INSERT INTO focus_time (user_id, focus_duration_seconds) 
       VALUES (?, ?)`,
      [userId, focus_duration_seconds]
    );
    
    if (!result?.affectedRows) {
      throw new Error('Database insertion failed');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Focus time saved successfully',
      focus_time_id: result.insertId,
      duration_saved: focus_duration_seconds
    });
    
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        error: error.message.includes('Unauthorized') ? 'Authentication required' : 'Failed to save focus time',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// GET method to retrieve focus times for the authenticated user
export async function GET(request: NextRequest) {
  let connection;
  
  try {
    const { userId } = validateAuthCookies(request);
    
    connection = await db.getConnection();
    
    const [focusTimes]: any = await connection.execute(
      `SELECT id, focus_duration_seconds, created_at 
       FROM focus_time
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [userId]
    );
    
    // Calculate total focus time
    const totalFocusTime = Array.isArray(focusTimes) 
      ? focusTimes.reduce((total, session) => total + session.focus_duration_seconds, 0)
      : 0;
    
    return NextResponse.json({
      sessions: Array.isArray(focusTimes) ? focusTimes : [],
      total_focus_seconds: totalFocusTime,
      total_focus_hours: (totalFocusTime / 3600).toFixed(2),
      session_count: Array.isArray(focusTimes) ? focusTimes.length : 0
    });
    
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: error.message.includes('Unauthorized') ? 'Authentication required' : 'Failed to fetch focus times',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}