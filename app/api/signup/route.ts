import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { name, email, college } = await request.json()

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db`
      SELECT id FROM users WHERE email = ${email} LIMIT 1`

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      )
    }

    // Determine if user is admin based on email
    const isAdmin = email.toLowerCase().includes("admin") || 
                   email.toLowerCase().includes("ajal") || 
                   email.toLowerCase().includes("tiya")

    // Create new user
    await db`
      INSERT INTO users (name, email, college, is_admin) VALUES (${name}, ${email}, ${college}, ${isAdmin})`

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
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}