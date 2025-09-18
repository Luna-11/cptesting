import { NextResponse } from 'next/server';
import { db } from '@script/db';
import type { NextRequest } from 'next/server';

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

// GET all events for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const { userId } = validateAuthCookies(request);

    const [events] = await db.execute(
      'SELECT * FROM calendar WHERE user_id = ? ORDER BY event_date ASC',
      [userId]
    );

    return NextResponse.json(Array.isArray(events) ? events : []);

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch events',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST new event for the logged-in user
export async function POST(request: NextRequest) {
  try {
    const { userId } = validateAuthCookies(request);
    const body = await request.json();

    const { event_name, event_date } = body;
    if (!event_name?.trim() || !event_date) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'event_name and event_date are required' },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      'INSERT INTO calendar (user_id, event_name, event_date) VALUES (?, ?, ?)',
      [userId, event_name.trim(), event_date]
    );

    if (!result?.affectedRows) {
      throw new Error('Database insertion failed');
    }

    return NextResponse.json({
      success: true,
      event: {
        event_id: result.insertId,
        user_id: userId,
        event_name: event_name.trim(),
        event_date,
      },
    });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add event',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE event by id for the logged-in user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = validateAuthCookies(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing event ID', details: 'id parameter is required' },
        { status: 400 }
      );
    }

    const [check]: any = await db.execute(
      'SELECT event_id FROM calendar WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (!check?.length) {
      return NextResponse.json(
        { error: 'Event not found', details: 'The event does not exist or you do not have permission' },
        { status: 404 }
      );
    }

    const [result]: any = await db.execute(
      'DELETE FROM calendar WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    return NextResponse.json({
      success: true,
      deleted: result.affectedRows === 1,
      eventId,
    });

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete event',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
