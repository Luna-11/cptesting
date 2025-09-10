import { NextResponse } from 'next/server';
import { db } from '@script/db'; // ✅ db is now a connection pool
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

// GET all vocabulary items for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const { userId } = validateAuthCookies(request);

    const [vocabulary] = await db.execute(
      'SELECT id, word, definition, status, important FROM vocabulary WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json(Array.isArray(vocabulary) ? vocabulary : []);

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch vocabulary',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST new vocabulary item for the logged-in user
export async function POST(request: NextRequest) {
  try {
    const { userId } = validateAuthCookies(request);
    const body = await request.json();

    const { word, definition, status = 'toStudy', important = false } = body;
    
    if (!word?.trim() || !definition?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'word and definition are required' },
        { status: 400 }
      );
    }

    const [result]: any = await db.execute(
      'INSERT INTO vocabulary (user_id, word, definition, status, important) VALUES (?, ?, ?, ?, ?)',
      [userId, word.trim(), definition.trim(), status, important]
    );

    if (!result?.affectedRows) {
      throw new Error('Database insertion failed');
    }

    return NextResponse.json({
      success: true,
      vocabulary: {
        id: result.insertId,
        user_id: userId,
        word: word.trim(),
        definition: definition.trim(),
        status,
        important
      },
    });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add vocabulary',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// PUT update vocabulary item for the logged-in user
export async function PUT(request: NextRequest) {
  try {
    const { userId } = validateAuthCookies(request);
    const body = await request.json();

    const { id, word, definition, status, important } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field', details: 'id is required' },
        { status: 400 }
      );
    }

    // Check if the vocabulary item exists and belongs to the user
    const [check]: any = await db.execute(
      'SELECT id FROM vocabulary WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!check?.length) {
      return NextResponse.json(
        { error: 'Vocabulary not found', details: 'The vocabulary item does not exist or you do not have permission' },
        { status: 404 }
      );
    }

    // Build dynamic update query based on provided fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (word !== undefined) {
      updateFields.push('word = ?');
      updateValues.push(word.trim());
    }
    if (definition !== undefined) {
      updateFields.push('definition = ?');
      updateValues.push(definition.trim());
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (important !== undefined) {
      updateFields.push('important = ?');
      updateValues.push(important);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', details: 'Provide at least one field to update' },
        { status: 400 }
      );
    }

    updateValues.push(id, userId);

    const [result]: any = await db.execute(
      `UPDATE vocabulary SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    return NextResponse.json({
      success: true,
      updated: result.affectedRows === 1,
      id,
    });

  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update vocabulary',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE vocabulary item by id for the logged-in user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = validateAuthCookies(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing vocabulary ID', details: 'id parameter is required' },
        { status: 400 }
      );
    }

    const [check]: any = await db.execute(
      'SELECT id FROM vocabulary WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!check?.length) {
      return NextResponse.json(
        { error: 'Vocabulary not found', details: 'The vocabulary item does not exist or you do not have permission' },
        { status: 404 }
      );
    }

    const [result]: any = await db.execute(
      'DELETE FROM vocabulary WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return NextResponse.json({
      success: true,
      deleted: result.affectedRows === 1,
      id,
    });

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete vocabulary',
        details: error.message,
        action: error.message.includes('Unauthorized') ? 'relogin' : 'retry',
      },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}