import { NextResponse } from "next/server"
import { adminAuth, adminDb, ADMIN_EMAILS } from "@/lib/firebaseAdmin"

export async function POST(request: Request) {
  try {
    const { idToken, name, email, college } = await request.json()

    if (!idToken || !name || !email) {
      return NextResponse.json(
        { error: "idToken, name and email are required" },
        { status: 400 }
      )
    }

    const decoded = await adminAuth.verifyIdToken(idToken)

    const isAdmin = ADMIN_EMAILS.has(email.toLowerCase())

    await adminDb.collection('users').doc(decoded.uid).set({
      uid: decoded.uid,
      email,
      name,
      college: college || null,
      isAdmin,
    }, { merge: true })

    return NextResponse.json(
      { 
        success: true,
        message: "Account ensured in Firestore",
        isAdmin
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    )
  }
}