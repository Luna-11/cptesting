// src/app/api/todo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@script/db';

export async function POST(request: Request) {
  console.log('[POST] /api/todo request received');
  let connection;
  
  try {
    // 1. Verify request is received
    console.log('1. Parsing request body...');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // 2. Validate required fields
    const { user_id, task_name } = body;
    if (!user_id || !task_name) {
      console.error('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'user_id and task_name are required' },
        { status: 400 }
      );
    }

    // 3. Get database connection
    console.log('2. Getting database connection...');
    connection = await db.getConnection();
    console.log('Database connection established');

    // 4. Begin transaction
    console.log('3. Starting transaction...');
    await connection.beginTransaction();

    // 5. Prepare insert query
    const insertQuery = `
      INSERT INTO todo_list (
        user_id, 
        task_name, 
        status, 
        subject_id, 
        important,
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const insertParams = [
      user_id,
      task_name,
      body.status || 'toStart',
      body.subject_id || null,
      body.important ? 1 : 0
    ];

    console.log('4. Executing query:', insertQuery);
    console.log('With parameters:', insertParams);

    // 6. Execute insert
    const [insertResult] = await connection.query(insertQuery, insertParams);
    console.log('5. Insert result:', insertResult);

    // 7. Verify insertion
    if ((insertResult as any).affectedRows !== 1) {
      console.error('Insertion failed - no rows affected');
      await connection.rollback();
      return NextResponse.json(
        { error: 'Failed to insert task' },
        { status: 500 }
      );
    }

    // 8. Fetch the inserted record
    console.log('6. Fetching inserted record...');
    const [newTask] = await connection.query(
      'SELECT * FROM todo_tasks WHERE task_id = ?',
      [(insertResult as any).insertId]
    );
    console.log('New task:', newTask);

    // 9. Commit transaction
    await connection.commit();
    console.log('7. Transaction committed successfully');

    return NextResponse.json(
      { success: true, data: (newTask as any[])[0] },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('8. ERROR:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });

    if (connection) {
      try {
        await connection.rollback();
        console.log('Transaction rolled back');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }

    return NextResponse.json(
      { 
        error: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code
        } : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
        console.log('Connection released');
      } catch (releaseError) {
        console.error('Connection release failed:', releaseError);
      }
    }
  }
}