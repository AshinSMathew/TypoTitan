import { NextRequest, NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"

// GET /api/admin/rooms - Get all rooms created by admin
export async function GET(request: NextRequest) {
  try {
    // Verify Firebase token
    const cookieToken = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('authToken='))?.split('=')[1]
    const authHeader = request.headers.get('authorization') || ''
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    const idToken = headerToken || cookieToken
    
    if (!idToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    
    // Check if user is admin
    if (!decodedToken.email?.endsWith('@ajal.com') && !decodedToken.email?.endsWith('@tiya.com')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Get all rooms
    const roomsSnap = await adminDb.collection('rooms')
      .where('created_by', '==', decodedToken.uid)
      .orderBy('created_at', 'desc')
      .get()

    const rooms = await Promise.all(roomsSnap.docs.map(async (doc) => {
      const roomData = doc.data()
      
      // Get participant count
      const partsSnap = await doc.ref.collection('participants').get()
      
      return {
        id: doc.id,
        ...roomData,
        participant_count: partsSnap.size
      }
    }))

    return NextResponse.json(
      { 
        success: true,
        rooms
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Get admin rooms error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}