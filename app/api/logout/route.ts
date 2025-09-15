import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    )

    // Clear the auth cookie (Firebase ID token stored here for server use)
    response.cookies.set({
      name: 'authToken',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
      sameSite: 'strict'
    })

    return response

  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}