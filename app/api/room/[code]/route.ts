import { NextRequest, NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"

// GET /api/rooms/[code] - Get room data
export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }){
  try {
    const { code } = await context.params

    // Verify Firebase token
    const cookieToken = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('authToken='))?.split('=')[1]
    const authHeader = request.headers.get('authorization') || ''
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    const idToken = headerToken || cookieToken
    if (!idToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    await adminAuth.verifyIdToken(idToken)

    // Get room data
    const roomSnap = await adminDb.collection('rooms').doc(code).get()
    if (!roomSnap.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Get participants
    const partsSnap = await adminDb.collection('rooms').doc(code).collection('participants').get()
    const participants = partsSnap.docs.map((d) => d.data())
    return NextResponse.json(
      { 
        success: true,
        room: roomSnap.data(),
        participants
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