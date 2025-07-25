import { NextResponse } from 'next/server';
import { db } from '@script/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    console.log('User ID from cookies:', userId); // Add this line
    
    if (!userId) {
      console.log('No user ID found - unauthorized'); // Add this line
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const [tasks] = await db.query(`
      SELECT 
        task_id,
        user_id,
        task_name,
        status,
        completed_at,
        important,
        created_at
      FROM todo_tasks
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    
    console.log('Tasks from database:', tasks); // Add this line
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore =await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { task_name } = body;

    if (!task_name) {
      return NextResponse.json(
        { error: 'task_name is required' },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO todo_tasks 
       (user_id, task_name, status, important, created_at) 
       VALUES (?, ?, 'toStart', false, NOW())`,
      [userId, task_name]
    );

    const [newTask] = await db.query(
      `SELECT 
        task_id,
        user_id,
        task_name,
        status,
        completed_at,
        important,
        created_at
       FROM todo_tasks WHERE task_id = ?`,
      [(result as any).insertId]
    );

    return NextResponse.json(
      { data: (newTask as any[])[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}