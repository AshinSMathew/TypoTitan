import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

// GET /api/spectate/[code] - Get room data for spectating
export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params

    // Get room data
    const roomSnap = await adminDb.collection('rooms').doc(code).get()
    if (!roomSnap.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = roomSnap.data()
    
    // Get participants
    const partsSnap = await adminDb.collection('rooms').doc(code).collection('participants').get()
    const participants = partsSnap.docs.map((d) => d.data())
    
    // Get game results
    const resultsSnap = await adminDb.collection('rooms').doc(code).collection('results').get()
    const results = resultsSnap.docs.map((d) => d.data())
    
    // Combine participant data with their results
    const players = participants.map(participant => {
      const playerResult = results.find(result => result.playerId === participant.id)
      
      return {
        id: participant.id,
        name: participant.name,
        wpm: playerResult?.wpm || 0,
        accuracy: playerResult?.accuracy || 0,
        progress: playerResult?.progress || 0,
        isFinished: playerResult?.isFinished || false,
        errors: playerResult?.errors || 0,
        currentCommand: "Typing in progress..." // This would need real-time updates
      }
    })

    return NextResponse.json(
      { 
        success: true,
        room: roomData,
        players,
        gameState: {
          currentLevel: roomData?.current_level || "easy",
          isActive: roomData?.status === "in_progress",
          timeLeft: roomData?.time_left || 300
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Get spectate data error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}