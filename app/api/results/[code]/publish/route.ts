import { NextRequest, NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest, context: { params: Promise<{ code: string }> }) {
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
    
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    
    // Check if user is admin
    if (!decodedToken.email?.endsWith('@ajal.com') && !decodedToken.email?.endsWith('@tiya.com')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Update room to publish results
    await adminDb.collection('rooms').doc(code).update({
      results_published: true,
      published_at: new Date()
    })

    return NextResponse.json(
      { 
        success: true,
        message: "Results published successfully"
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Publish results error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}