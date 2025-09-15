import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as jose from "jose"

// GET /api/rooms/[code] - Get room data
export async function GET(request: Request, context: { params: { code: string } }){
  try {
    const { code } = await context.params
    console.log(code)

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

    // Get room data
    const roomResult = await db`
      SELECT * FROM rooms WHERE room_key = ${code}`

    if (roomResult.length === 0) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      )
    }

    // Get participants
    const participantsResult = await db`
      SELECT u.id, u.name, u.email, u.college 
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = ${roomResult[0].id}`
    return NextResponse.json(
      { 
        success: true,
        room: roomResult[0],
        participants: participantsResult
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Get room error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}