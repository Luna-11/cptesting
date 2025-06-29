import { NextResponse } from 'next/server'
import { db } from '@script/db'

export const dynamic = 'force-dynamic'

// GET all events
export async function GET() {
  try {
    const [events] = await db.query('SELECT * FROM calendar')
    return NextResponse.json(events)
  } catch (error: any) {
    console.error('GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    )
  }
}

// POST new event
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, event_name, event_date } = body

    console.log('POST body:', body)

    if (!user_id || !event_name || !event_date) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, event_name, event_date' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const [userCheck]: any = await db.query('SELECT user_id FROM user WHERE user_id = ?', [user_id])
    console.log('User check result:', userCheck)

    if (!userCheck || userCheck.length === 0) {
      return NextResponse.json(
        { error: `User with id ${user_id} does not exist` },
        { status: 400 }
      )
    }

    // Insertar el evento en la tabla calendar
    const [result]: any = await db.query(
      'INSERT INTO calendar (user_id, event_name, event_date) VALUES (?, ?, ?)',
      [user_id, event_name, event_date]
    )
    console.log('Insert result:', result)

    if (!result || result.affectedRows !== 1) {
      return NextResponse.json(
        { error: 'Failed to insert event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Event saved', eventId: result.insertId })

  } catch (error: any) {
    console.error('POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add event', details: error.message },
      { status: 500 }
    )
  }
}


// DELETE event by id
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const [result]: any = await db.query('DELETE FROM calendar WHERE event_id = ?', [id])

    console.log('Delete result:', result)

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Event deleted' })
  } catch (error: any) {
    console.error('DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event', details: error.message },
      { status: 500 }
    )
  }
}
