import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@script/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface StudySessionInput {
  subject_id: number;
  duration: number;
  start_time: string;
  end_time: string;
  notes?: string | null;
}

interface BreakSessionInput {
  subject_id: number;
  duration: number;
  start_time: string;
  end_time: string;
  break_type: 'coffee' | 'meal' | 'other';
}

const MYANMAR_TIMEZONE_OFFSET = 6.5 * 60 * 60 * 1000;

function getMyanmarDate(date: Date): string {
  const myanmarTime = new Date(date.getTime() + MYANMAR_TIMEZONE_OFFSET);
  return myanmarTime.toISOString().split('T')[0];
}

function validateDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${isoString}`);
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function calculateDuration(startTime: string, endTime: string): number {
  return Math.floor(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

async function verifySubjectOwnership(subjectId: number, userId: string) {
  const [subject] = await db.query<RowDataPacket[]>(
    `SELECT id FROM subjects WHERE id = ? AND user_id = ? LIMIT 1`,
    [subjectId, userId]
  );
  if (subject.length === 0) {
    throw new Error(`Subject ${subjectId} not found or not owned by user`);
  }
}

async function getTodayStudySession(subjectId: number, userId: string) {
  const currentDateMyanmar = getMyanmarDate(new Date());

  const [sessions] = await db.query<RowDataPacket[]>(
    `SELECT * FROM study_sessions 
     WHERE subject_id = ? AND user_id = ? 
     AND DATE(CONVERT_TZ(start_time, '+00:00', '+06:30')) = ?
     LIMIT 1`,
    [subjectId, userId, currentDateMyanmar]
  );
  return sessions[0] || null;
}

async function getTodaySameTypeBreakSession(
  subjectId: number, 
  userId: string,
  breakType: 'coffee' | 'meal' | 'other'
) {
  const currentDateMyanmar = getMyanmarDate(new Date());

  const [sessions] = await db.query<RowDataPacket[]>(
    `SELECT * FROM break_sessions 
     WHERE subject_id = ? AND user_id = ? AND break_type = ?
     AND DATE(CONVERT_TZ(start_time, '+00:00', '+06:30')) = ?
     ORDER BY end_time DESC
     LIMIT 1`,
    [subjectId, userId, breakType, currentDateMyanmar]
  );
  return sessions[0] || null;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let requestData: any;
  try {
    requestData = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!requestData.subject_id || !requestData.start_time || !requestData.end_time) {
    return NextResponse.json(
      { error: "Missing required fields (subject_id, start_time, end_time)" },
      { status: 400 }
    );
  }

  const connection = await db.getConnection();
  try {
    await connection.query('START TRANSACTION');

    await verifySubjectOwnership(requestData.subject_id, userId);

    const sessionDuration = requestData.duration ||
      calculateDuration(requestData.start_time, requestData.end_time);

    const isBreakSession = requestData.break_type !== undefined;

    if (isBreakSession) {
      const breakType = requestData.break_type;
      const existingSession = await getTodaySameTypeBreakSession(
        requestData.subject_id,
        userId,
        breakType
      );

      if (existingSession) {
        // Update existing break session of same type (applies to all break types)
        await connection.query<ResultSetHeader>(
          `UPDATE break_sessions 
           SET duration = duration + ?, 
               end_time = GREATEST(end_time, ?)
           WHERE id = ?`,
          [
            sessionDuration,
            validateDateTime(requestData.end_time),
            existingSession.id
          ]
        );

        await connection.query('COMMIT');
        return NextResponse.json({
          success: true,
          sessionId: existingSession.id,
          type: 'break',
          break_type: breakType,
          action: 'updated',
          totalDuration: existingSession.duration + sessionDuration
        });
      } else {
        // Create new break session (only when no existing session of same type exists)
        const validatedData: BreakSessionInput = {
          subject_id: requestData.subject_id,
          duration: sessionDuration,
          start_time: validateDateTime(requestData.start_time),
          end_time: validateDateTime(requestData.end_time),
          break_type: breakType
        };

        const [result] = await connection.query<ResultSetHeader>(
          `INSERT INTO break_sessions 
           (subject_id, user_id, duration, start_time, end_time, break_type)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            validatedData.subject_id,
            userId,
            validatedData.duration,
            validatedData.start_time,
            validatedData.end_time,
            validatedData.break_type
          ]
        );

        await connection.query('COMMIT');
        return NextResponse.json({
          success: true,
          sessionId: result.insertId,
          type: 'break',
          break_type: breakType,
          action: 'created',
          totalDuration: validatedData.duration
        }, { status: 201 });
      }
    } else {
      // Handle study session logic (unchanged)
      const existingSession = await getTodayStudySession(
        requestData.subject_id,
        userId
      );

      if (existingSession) {
        await connection.query<ResultSetHeader>(
          `UPDATE study_sessions 
           SET duration = duration + ?, 
               end_time = GREATEST(end_time, ?),
               notes = COALESCE(?, notes)
           WHERE id = ?`,
          [
            sessionDuration,
            validateDateTime(requestData.end_time),
            requestData.notes || null,
            existingSession.id
          ]
        );

        await connection.query('COMMIT');
        return NextResponse.json({
          success: true,
          sessionId: existingSession.id,
          type: 'study',
          action: 'updated',
          totalDuration: existingSession.duration + sessionDuration
        });
      } else {
        const validatedData: StudySessionInput = {
          subject_id: requestData.subject_id,
          duration: sessionDuration,
          start_time: validateDateTime(requestData.start_time),
          end_time: validateDateTime(requestData.end_time),
          notes: requestData.notes || null
        };

        const [result] = await connection.query<ResultSetHeader>(
          `INSERT INTO study_sessions 
           (subject_id, user_id, duration, start_time, end_time, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            validatedData.subject_id,
            userId,
            validatedData.duration,
            validatedData.start_time,
            validatedData.end_time,
            validatedData.notes
          ]
        );

        await connection.query('COMMIT');
        return NextResponse.json({
          success: true,
          sessionId: result.insertId,
          type: 'study',
          action: 'created',
          totalDuration: validatedData.duration
        }, { status: 201 });
      }
    }
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('Database error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database operation failed" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// ... (keep the existing GET endpoint exactly as is)

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subject_id = searchParams.get('subject_id');
    const date = searchParams.get('date');
    const group_by_day = searchParams.get('group_by_day') === 'true';
    const type = searchParams.get('type'); // 'study', 'break', or undefined for both

    let query: string;
    const params: (string | number)[] = [userId];

    if (subject_id) params.push(Number(subject_id));
    if (date) params.push(date);

    if (group_by_day) {
      query = `
        SELECT 
          type,
          subject_id,
          break_type,
          DATE(CONVERT_TZ(start_time, '+00:00', '+06:30')) AS session_date,
          SUM(duration) AS total_duration,
          MIN(start_time) AS first_start_time,
          MAX(end_time) AS last_end_time,
          COUNT(*) AS session_count
        FROM (
          ${type !== 'break' ? `
            SELECT 'study' AS type, subject_id, duration, start_time, end_time, NULL AS break_type
            FROM study_sessions
            WHERE user_id = ? ${subject_id ? 'AND subject_id = ?' : ''} ${date ? 'AND DATE(CONVERT_TZ(start_time, \'+00:00\', \'+06:30\')) = ?' : ''}
            ${type ? '' : 'UNION ALL'}
          ` : ''}
          ${type !== 'study' ? `
            SELECT 'break' AS type, subject_id, duration, start_time, end_time, break_type
            FROM break_sessions
            WHERE user_id = ? ${subject_id ? 'AND subject_id = ?' : ''} ${date ? 'AND DATE(CONVERT_TZ(start_time, \'+00:00\', \'+06:30\')) = ?' : ''}
          ` : ''}
        ) AS combined_sessions
        GROUP BY type, subject_id, session_date, break_type
        ORDER BY session_date DESC, type ASC
      `;

      if (type !== 'break') params.push(userId);
      if (subject_id) params.push(Number(subject_id));
      if (date) params.push(date);
      
      if (type !== 'study') params.push(userId);
      if (subject_id) params.push(Number(subject_id));
      if (date) params.push(date);
    } else {
      query = `
        ${type !== 'break' ? `
          (SELECT 
            'study' AS type, id, subject_id, duration, start_time, end_time, NULL AS break_type, notes
          FROM study_sessions
          WHERE user_id = ? ${subject_id ? 'AND subject_id = ?' : ''} ${date ? 'AND DATE(CONVERT_TZ(start_time, \'+00:00\', \'+06:30\')) = ?' : ''})
          ${type ? '' : 'UNION ALL'}
        ` : ''}
        ${type !== 'study' ? `
          (SELECT 
            'break' AS type, id, subject_id, duration, start_time, end_time, break_type, NULL AS notes
          FROM break_sessions
          WHERE user_id = ? ${subject_id ? 'AND subject_id = ?' : ''} ${date ? 'AND DATE(CONVERT_TZ(start_time, \'+00:00\', \'+06:30\')) = ?' : ''})
        ` : ''}
        ORDER BY start_time DESC
      `;

      if (type !== 'break') {
        params.push(userId);
        if (subject_id) params.push(Number(subject_id));
        if (date) params.push(date);
      }
      if (type !== 'study') {
        params.push(userId);
        if (subject_id) params.push(Number(subject_id));
        if (date) params.push(date);
      }
    }

    const [sessions] = await db.query<RowDataPacket[]>(query, params);

    const enhanced = group_by_day
      ? sessions.map((session) => ({
          ...session,
          totalDurationFormatted: formatDuration(session.total_duration),
        }))
      : sessions.map((session) => ({
          ...session,
          durationFormatted: formatDuration(session.duration),
        }));

    return NextResponse.json({ success: true, data: enhanced });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}