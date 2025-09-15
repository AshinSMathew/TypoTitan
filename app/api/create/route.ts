import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as jose from "jose"

// POST /api/rooms - Create a new room
export async function POST(request: Request) {
  try {
    // Verify authentication
    const token = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('authToken='))?.split('=')[1]

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jose.jwtVerify(token, secret)
    
    if (!payload.id) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const { name } = await request.json()
    
    // Generate unique room code
    const code = generateRoomKey()
    
    // Insert room into database
    const result = await db`
      INSERT INTO rooms (room_key, name, created_by, is_public) 
       VALUES (${code}, ${name || `Room by ${payload.name}`}, ${payload.id}, ${true}) 
       RETURNING id, room_key, name, created_by, is_public, created_at`

    // Add creator as participant
    await db`
      INSERT INTO room_participants (room_id, user_id) 
       VALUES (${result[0].id}, ${payload.id})`

    return NextResponse.json(
      { 
        success: true,
        room: result[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Create room error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/rooms - Get all public rooms
export async function GET(request: Request) {
  try {
    // Verify authentication
    const token = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('authToken='))?.split('=')[1]

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jose.jwtVerify(token, secret)
    
    if (!payload.id) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Get all public rooms with participant count
    const result = await db`
      SELECT r.*, COUNT(rp.user_id) as participant_count
       FROM rooms r
       LEFT JOIN room_participants rp ON r.id = rp.room_id
       WHERE r.is_public = true AND r.status = 'waiting'
       GROUP BY r.id
       ORDER BY r.created_at DESC`

    return NextResponse.json(
      { 
        success: true,
        rooms: result
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Get rooms error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to generate unique room key
function generateRoomKey(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}