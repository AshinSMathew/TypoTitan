import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    const cookieToken = request.cookies.get('authToken')?.value
    const idToken = tokenFromHeader || cookieToken

    if (!idToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const decoded = await adminAuth.verifyIdToken(idToken)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    const userData = userDoc.exists ? (userDoc.data() as { email?: string; name?: string; college?: string; isAdmin?: boolean }) : {}

    return NextResponse.json({ 
      success: true,
      user: {
        uid: decoded.uid,
        email: userData.email || decoded.email || null,
        name: userData.name || decoded.name || null,
        college: userData.college || null,
        isAdmin: !!userData.isAdmin,
      }
    }, { status: 200 })

  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    )
  }
}