import { NextRequest, NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const cookieToken = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('authToken='))?.split('=')[1]
    const authHeader = request.headers.get('authorization') || ''
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    const idToken = headerToken || cookieToken
    if (!idToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const decoded = await adminAuth.verifyIdToken(idToken)

    const roomRef = adminDb.collection('rooms').doc(code)
    const roomSnap = await roomRef.get()
    if (!roomSnap.exists) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    if (roomSnap.data()?.created_by !== decoded.uid) {
      return NextResponse.json({ error: 'Only host can start the game' }, { status: 403 })
    }

    await roomRef.set({ status: 'in-progress', started_at: new Date().toISOString() }, { merge: true })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Start room error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


