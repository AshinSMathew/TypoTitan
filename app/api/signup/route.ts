import { NextResponse } from "next/server"
import { adminAuth, adminDb, ADMIN_EMAILS } from "@/lib/firebaseAdmin"

export async function POST(request: Request) {
  try {
    const { idToken, name, email, college } = await request.json()
    //console.log("Received data:", { idToken, name, email, college })

    if (!idToken || !name || !email ||!college) {
      return NextResponse.json(
        { error: "idToken, name and email are required" },
        { status: 400 }
      )
    }

    const decoded = await adminAuth.verifyIdToken(idToken)

    const isAdmin = ADMIN_EMAILS.has(email.toLowerCase())

    const userData = {
      uid: decoded.uid,
      email,
      name,
      isAdmin,
      college,
    }
    console.log(userData)

    await adminDb.collection('users').doc(decoded.uid).set(userData)

    return NextResponse.json(
      { 
        success: true,
        message: "Account created successfully",
        isAdmin
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Invalid token or server error" },
      { status: 401 }
    )
  }
}