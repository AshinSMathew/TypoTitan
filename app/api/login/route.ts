import { NextResponse } from "next/server"
import { adminAuth, adminDb, ADMIN_EMAILS } from "@/lib/firebaseAdmin"

export async function POST(request: Request) {
  try {
    const { idToken, name, email, college } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 })
    }

    const decoded = await adminAuth.verifyIdToken(idToken)

    // Persist minimal profile in Firestore users collection
    if (email && name) {
      const isAdmin = email ? ADMIN_EMAILS.has(email.toLowerCase()) : false
      await adminDb.collection('users').doc(decoded.uid).set({
        uid: decoded.uid,
        email: email || decoded.email || null,
        name: name || decoded.name || null,
        college: college || null,
        isAdmin,
      }, { merge: true })
    }

    const response = NextResponse.json(
      {
        success: true,
        user: {
          uid: decoded.uid,
          email: email || decoded.email,
          name: name || decoded.name,
          college: college || null,
          isAdmin: email ? ADMIN_EMAILS.has(email.toLowerCase()) : false,
        }
      },
      { status: 200 }
    )

    // Set cookie for server routes convenience (still Firebase ID token)
    response.cookies.set({
      name: 'authToken',
      value: idToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'strict'
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    )
  }
}