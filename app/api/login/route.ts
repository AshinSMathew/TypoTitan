import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as jose from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const userResult = await db`
      SELECT id, name, email, college, is_admin FROM users WHERE email = ${email} LIMIT 1`

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      )
    }

    const user = userResult[0]

    // Generate JWT token
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      isAdmin: user.is_admin
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    // Create response
    const response = NextResponse.json(
      { 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          college: user.college,
          isAdmin: user.is_admin
        }
      },
      { status: 200 }
    )

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      sameSite: 'strict'
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}