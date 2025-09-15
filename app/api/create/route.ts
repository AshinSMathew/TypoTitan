import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"

// POST /api/rooms - Create a new room
export async function POST(request: Request) {
  try {
    // Verify Firebase ID token (from cookie or header)
    const cookieToken = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('authToken='))?.split('=')[1]
    const authHeader = request.headers.get('authorization') || ''
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    const idToken = headerToken || cookieToken

    if (!idToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = await adminAuth.verifyIdToken(idToken)

    const { name } = await request.json()
    
    // Generate unique room code
    const code = generateRoomKey()
    
    // Create room document in Firestore
    const roomRef = adminDb.collection('rooms').doc(code)
    await roomRef.set({
      room_key: code,
      name: name || `Room by ${decoded.name || decoded.email}`,
      created_by: decoded.uid,
      is_public: true,
      status: 'waiting',
      created_at: new Date().toISOString(),
    })

    // Add creator as participant
    await roomRef.collection('participants').doc(decoded.uid).set({
      id: decoded.uid,
      name: decoded.name || null,
      email: decoded.email || null,
      college: null,
      is_host: true,
      joined_at: new Date().toISOString(),
    })

    return NextResponse.json(
      { 
        success: true,
        room: {
          room_key: code,
          name: name || `Room by ${decoded.name || decoded.email}`,
          created_by: decoded.uid,
          is_public: true,
          status: 'waiting',
          created_at: new Date().toISOString(),
        }
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

    // Get all public rooms with participant count
    const roomsSnap = await adminDb.collection('rooms')
      .where('is_public', '==', true)
      .where('status', '==', 'waiting')
      .orderBy('created_at', 'desc')
      .get()

    const rooms = await Promise.all(roomsSnap.docs.map(async (doc) => {
      const data = doc.data() as Record<string, unknown>
      const partsSnap = await adminDb.collection('rooms').doc(doc.id).collection('participants').get()
      return { ...data, participant_count: partsSnap.size }
    }))

    return NextResponse.json(
      { 
        success: true,
        rooms
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