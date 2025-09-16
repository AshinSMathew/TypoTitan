import { NextRequest, NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"

// POST /api/game/[code] - Submit game results
export async function POST(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params
    const { playerId, wpm, accuracy, errors, isFinished } = await request.json()

    // Verify Firebase token
    const cookieToken = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('authToken='))?.split('=')[1]
    const authHeader = request.headers.get('authorization') || ''
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    const idToken = headerToken || cookieToken
    
    if (!idToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Update player results in the room
    await adminDb.collection('rooms').doc(code)
      .collection('results')
      .doc(playerId)
      .set({
        playerId,
        wpm,
        accuracy,
        errors,
        isFinished,
        timestamp: new Date()
      }, { merge: true })

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )

  } catch (error) {
    console.error("Submit results error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/game/[code] - Get game data
export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
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
    console.error("Get game error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}