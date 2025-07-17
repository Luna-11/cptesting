import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';

// app/api/todo/route.ts
export async function GET(req: NextRequest) {
  try {
    const [rows] = await db.query('SELECT * FROM todo_tasks ORDER BY created_at DESC');
    // Ensure rows is always an array
    const tasks = Array.isArray(rows) ? rows : [rows];
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, task_name, status, subject_id, important } = body;

    if (!task_name) {
      return NextResponse.json(
        { message: 'Task name is required.' }, 
        { status: 400 }
      );
    }

    const [result] = await db.query(
      'INSERT INTO todo_tasks (user_id, task_name, status, subject_id, important, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, task_name, status || 'toStart', subject_id, important || false]
    );

    // Fetch the newly created task to return complete data
    const [newTask] = await db.query(
      'SELECT * FROM todo_tasks WHERE task_id = ?',
      [(result as any).insertId]
    );

    return NextResponse.json((newTask as any[])[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Failed to create task' },
      { status: 500 }
    );
  }
}