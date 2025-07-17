import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM todo_tasks WHERE task_id = ?',
      [params.id]
    );
    
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { message: 'Task not found.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { task_name, status, subject_id, important } = body;

    await db.query(
      `UPDATE todo_tasks 
       SET task_name = ?, status = ?, subject_id = ?, important = ?
       WHERE task_id = ?`,
      [task_name, status, subject_id, important, params.id]
    );

    // Return the updated task
    const [updatedTask] = await db.query(
      'SELECT * FROM todo_tasks WHERE task_id = ?',
      [params.id]
    );

    return NextResponse.json((updatedTask as any[])[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.query('DELETE FROM todo_tasks WHERE task_id = ?', [params.id]);
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Failed to delete task' },
      { status: 500 }
    );
  }
}