"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Terminal } from "lucide-react"

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState("")

  const createRoom = () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/room/${roomCode}`)
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Terminal className="w-10 h-10 text-primary neon-glow" />
              <h1 className="text-4xl font-bold font-mono">Create Arena</h1>
            </div>
            <p className="text-muted-foreground">Set up your cybersecurity typing challenge</p>
          </div>

          <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-primary">Create Room</CardTitle>
              <CardDescription>Minimal setup — no limits, no timers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Name */}
              <div className="space-y-2">
                <Label htmlFor="roomName">Arena Name (Optional)</Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Elite Hackers Only"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-input border-border focus:border-primary"
                />
              </div>

              {/* Create Button */}
              <Button onClick={createRoom} className="w-full neon-glow" size="lg">
                Create Arena
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
