import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@script/db";
import type { RowDataPacket } from "mysql2/promise";

// Helper function to safely parse float values
const safeParseFloat = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get study sessions data for the last 7 days (with precise hours)
    const [studySessions] = await db.query<RowDataPacket[]>(`
      SELECT 
        DATE(CONVERT_TZ(start_time, '+00:00', '+06:30')) AS day,
        DAYNAME(CONVERT_TZ(start_time, '+00:00', '+06:30')) AS day_name,
        GREATEST(COALESCE(SUM(duration) / 3600, 0), 0.01) AS hours,  -- Ensure minimum 0.01 hours
        DATE_FORMAT(MIN(start_time), '%H:%i') AS start_time,
        DATE_FORMAT(MAX(end_time), '%H:%i') AS end_time
      FROM study_sessions
      WHERE user_id = ?
      AND start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY day, day_name
      ORDER BY day ASC
    `, [userId]);

    // Get break sessions data
    const [breakSessions] = await db.query<RowDataPacket[]>(`
      SELECT 
        break_type AS name,
        COALESCE(SUM(duration) / 3600, 0) AS value
      FROM break_sessions
      WHERE user_id = ?
      AND start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY break_type
    `, [userId]);

    // Get combined study and break data (with precise hours)
    const [overallData] = await db.query<RowDataPacket[]>(`
      SELECT 
        DATE(CONVERT_TZ(s.start_time, '+00:00', '+06:30')) AS day,
        DAYNAME(CONVERT_TZ(s.start_time, '+00:00', '+06:30')) AS day_name,
        GREATEST(COALESCE(SUM(s.duration) / 3600, 0), 0.01) AS study,
        COALESCE(SUM(b.duration) / 3600, 0) AS break
      FROM study_sessions s
      LEFT JOIN break_sessions b ON 
        DATE(CONVERT_TZ(s.start_time, '+00:00', '+06:30')) = DATE(CONVERT_TZ(b.start_time, '+00:00', '+06:30'))
        AND b.user_id = ?
      WHERE s.user_id = ?
      AND s.start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY day, day_name
      ORDER BY day ASC
    `, [userId, userId]);

    // Get timeline data with precise durations
    const [timelineData] = await db.query<RowDataPacket[]>(`
      (SELECT 
        'study' AS type,
        id,
        subject_id,
        COALESCE(duration / 60, 0) AS duration_minutes,
        start_time,
        end_time,
        (SELECT name FROM subjects WHERE id = subject_id) AS task_name,
        'Study' AS category,
        notes
      FROM study_sessions
      WHERE user_id = ?
      AND DATE(CONVERT_TZ(start_time, '+00:00', '+06:30')) = CURDATE())
      
      UNION ALL
      
      (SELECT 
        'break' AS type,
        id,
        subject_id,
        COALESCE(duration / 60, 0) AS duration_minutes,
        start_time,
        end_time,
        CONCAT(COALESCE(break_type, 'Unknown'), ' break') AS task_name,
        'Break' AS category,
        NULL AS notes
      FROM break_sessions
      WHERE user_id = ?
      AND DATE(CONVERT_TZ(start_time, '+00:00', '+06:30')) = CURDATE())
      
      ORDER BY start_time ASC
    `, [userId, userId]);

    // Get calendar data ensuring tiny sessions show as 0+
    const [calendarData] = await db.query<RowDataPacket[]>(`
      SELECT 
        DATE(CONVERT_TZ(start_time, '+00:00', '+06:30')) AS date,
        GREATEST(COALESCE(SUM(duration) / 3600, 0), 0.01) AS hours  -- Minimum 0.01 hours (36 seconds)
      FROM study_sessions
      WHERE user_id = ?
      AND YEAR(CONVERT_TZ(start_time, '+00:00', '+06:30')) = YEAR(CURDATE())
      AND MONTH(CONVERT_TZ(start_time, '+00:00', '+06:30')) = MONTH(CURDATE())
      GROUP BY date
    `, [userId]);

    return NextResponse.json({
      success: true,
      data: {
        studyData: studySessions.map(session => ({
          day: session.day_name || 'Unknown',
          hours: safeParseFloat(session.hours, 0.01),
          date: session.day || new Date().toISOString().split('T')[0],
          start: session.start_time || '00:00',
          end: session.end_time || '00:00'
        })),
        breakData: breakSessions.map(session => ({
          name: session.name || 'Unknown',
          value: safeParseFloat(session.value, 0)
        })),
        overallData: overallData.map(session => ({
          day: session.day_name || 'Unknown',
          study: safeParseFloat(session.study, 0.01),
          break: safeParseFloat(session.break, 0)
        })),
        timelineData: timelineData.map(session => ({
          id: session.id,
          startTime: session.start_time,
          endTime: session.end_time,
          duration: safeParseFloat(session.duration_minutes, 0),
          taskName: session.task_name || 'Unknown Task',
          category: session.category || 'Unknown',
          notes: session.notes
        })),
        calendarData: calendarData.map(day => ({
          date: day.date || new Date().toISOString().split('T')[0],
          hours: safeParseFloat(day.hours, 0.01)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch report data" },
      { status: 500 }
    );
  }
}