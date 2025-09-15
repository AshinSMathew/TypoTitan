"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Terminal, Loader2 } from "lucide-react"

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const createRoom = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: roomName }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push(`/room/${data.room.room_key}`)
      } else {
        setError(data.error || "Failed to create room")
      }
    } catch (error) {
      console.error("Create room error:", error)
      setError("Failed to create room. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
              {/* Error message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded-md">
                  {error}
                </div>
              )}

              {/* Room Name */}
              <div className="space-y-2">
                <Label htmlFor="roomName">Arena Name (Optional)</Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Elite Hackers Only"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-input border-border focus:border-primary"
                  disabled={isLoading}
                />
              </div>

              {/* Create Button */}
              <Button 
                onClick={createRoom} 
                className="w-full neon-glow" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Arena"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin")}
              className="text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}