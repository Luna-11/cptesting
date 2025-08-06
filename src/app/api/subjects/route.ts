// app/api/subjects/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@script/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface Subject extends RowDataPacket {
  id: number;
  name: string;
  notes: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export async function GET() {
  const cookieStore =await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  try {
    const [subjects] = await db.execute<Subject[]>(
      'SELECT * FROM subjects WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore =await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  try {
    const { name, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Missing required fields (name, color)' },
        { status: 400 }
      );
    }

    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO subjects (name, color, user_id) VALUES (?, ?, ?)',
      [name, color, userId]
    );

    const [subjects] = await db.execute<Subject[]>(
      'SELECT * FROM subjects WHERE id = ? AND user_id = ?',
      [result.insertId, userId]
    );

    if (!subjects.length) {
      return NextResponse.json(
        { error: 'Failed to retrieve created subject' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Subject created successfully',
        data: subjects[0] 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}