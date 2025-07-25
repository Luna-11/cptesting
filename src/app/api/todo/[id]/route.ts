import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const [rows] = await db.query(
      `SELECT 
        task_id,
        user_id,
        task_name,
        status,
        completed_at,
        important,
        created_at
       FROM todo_tasks WHERE task_id = ? AND user_id = ?`,
      [params.id, userId]
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
    const cookieStore =await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { task_name, status, important } = body;

    await db.query(
      `UPDATE todo_tasks 
       SET task_name = ?, status = ?, important = ?
       WHERE task_id = ? AND user_id = ?`,
      [task_name, status, important, params.id, userId]
    );

    const [updatedTask] = await db.query(
      `SELECT 
        task_id,
        user_id,
        task_name,
        status,
        completed_at,
        important,
        created_at
       FROM todo_tasks WHERE task_id = ? AND user_id = ?`,
      [params.id, userId]
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
    const cookieStore =await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await db.query(
      'DELETE FROM todo_tasks WHERE task_id = ? AND user_id = ?', 
      [params.id, userId]
    );
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Failed to delete task' },
      { status: 500 }
    );
  }
}