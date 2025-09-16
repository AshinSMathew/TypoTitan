import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

// GET /api/results/[code] - Get results for a room
export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params

    // Get room data
    const roomSnap = await adminDb.collection('rooms').doc(code).get()
    if (!roomSnap.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = roomSnap.data()
    
    // Check if results are published
    if (!roomData?.results_published) {
      return NextResponse.json({
        success: true,
        results_published: false,
        message: "Results not published yet"
      }, { status: 200 })
    }

    // Get participants
    const partsSnap = await adminDb.collection('rooms').doc(code).collection('participants').get()
    const participants = partsSnap.docs.map((d) => d.data())
    
    // Get game results
    const resultsSnap = await adminDb.collection('rooms').doc(code).collection('results').get()
    const results = resultsSnap.docs.map((d) => d.data())
    
    // Combine participant data with their results and calculate ranks
    const players = participants.map(participant => {
      const playerResult = results.find(result => result.playerId === participant.id)
      
      return {
        id: participant.id,
        name: participant.name,
        wpm: playerResult?.wpm || 0,
        accuracy: playerResult?.accuracy || 0,
        completionTime: playerResult?.completionTime || 0,
        totalErrors: playerResult?.errors || 0,
        isFinished: playerResult?.isFinished || false,
      }
    })

    // Sort by WPM and accuracy to determine ranks
    const rankedPlayers = players
      .sort((a, b) => {
        const scoreA = (a.wpm * a.accuracy) / 100
        const scoreB = (b.wpm * b.accuracy) / 100
        return scoreB - scoreA
      })
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }))

    return NextResponse.json(
      { 
        success: true,
        results_published: true,
        room: roomData,
        players: rankedPlayers
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Get results error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}