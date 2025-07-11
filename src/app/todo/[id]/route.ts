import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const [rows] = await db.query('SELECT * FROM todo_tasks WHERE task_id = ?', [params.id]);
  if ((rows as any[]).length === 0) {
    return NextResponse.json({ message: 'Task not found.' }, { status: 404 });
  }
  return NextResponse.json((rows as any[])[0]);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { task_name, status, subject_id, completed_at, important } = body;

  await db.query(
    'UPDATE todo_tasks SET task_name = ?, status = ?, subject_id = ?, completed_at = ?, important = ? WHERE task_id = ?',
    [task_name, status, subject_id, completed_at, important, params.id]
  );

  return NextResponse.json({ message: 'Task updated.' });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await db.query('DELETE FROM todo_tasks WHERE task_id = ?', [params.id]);
  return NextResponse.json({ message: 'Task deleted.' });
}
