"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"

export default function JoinRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState("")

  const joinRoom = () => {
    if (!roomCode.trim()) {
      setError("Please fill in all fields")
      return
    }

    // In a real app, this would validate the room code
    if (roomCode.length < 4) {
      setError("Invalid room code")
      return
    }

    router.push(`/room/${roomCode.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-10 h-10 text-accent neon-glow" />
              <h1 className="text-4xl font-bold font-mono">Join Arena</h1>
            </div>
            <p className="text-muted-foreground">Enter the arena code to join the challenge</p>
          </div>

          <Card className="border-accent/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-main">Arena Access</CardTitle>
              <CardDescription>Join an existing typing challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Code */}
              <div className="space-y-2">
                <Label htmlFor="roomCode">Arena Code</Label>
                <Input
                  id="roomCode"
                  placeholder="e.g., HACK123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-input border-border focus:border-accent font-mono text-center text-lg"
                  maxLength={8}
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              {/* Join Button */}
              <Button
                onClick={joinRoom}
                className="w-full bg-white text-black hover:bg-black hover:text-white"
                size="lg"
                disabled={!roomCode.trim()}
              >
                Join Arena
              </Button>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
