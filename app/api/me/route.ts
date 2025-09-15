import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return NextResponse.json(
      { 
        success: true,
        user: payload
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    )
  }
}