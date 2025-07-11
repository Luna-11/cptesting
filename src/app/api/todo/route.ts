import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db'

export async function GET() {
  const [rows] = await db.query('SELECT * FROM todo_tasks ORDER BY task_id DESC');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, task_name, status, subject_id, important } = body;

  if (!task_name) {
    return NextResponse.json({ message: 'Task name is required.' }, { status: 400 });
  }

  const [result] = await db.query(
    'INSERT INTO todo_tasks (user_id, task_name, status, subject_id, important) VALUES (?, ?, ?, ?, ?)',
    [user_id, task_name, status, subject_id, important]
  );

  return NextResponse.json({ task_id: (result as any).insertId });
}
