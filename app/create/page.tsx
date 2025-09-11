"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Terminal, Users, Clock, Target } from "lucide-react"

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState([4])
  const [difficulty, setDifficulty] = useState("mixed")
  const [timeLimit, setTimeLimit] = useState([60])

  const createRoom = () => {
    // Generate random room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    // In a real app, this would create the room on the server
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
              <CardTitle className="text-primary">Arena Configuration</CardTitle>
              <CardDescription>Customize your typing challenge settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Player Name */}
              <div className="space-y-2">
                <Label htmlFor="playerName">Your Hacker Name</Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-input border-border focus:border-primary"
                />
              </div>

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

              {/* Max Players */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Max Players: {maxPlayers[0]}
                </Label>
                <Slider value={maxPlayers} onValueChange={setMaxPlayers} max={8} min={2} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2</span>
                  <span>8</span>
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Difficulty Mode
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy Only - Basic commands</SelectItem>
                    <SelectItem value="medium">Medium Only - Network tools</SelectItem>
                    <SelectItem value="hard">Hard Only - Advanced security</SelectItem>
                    <SelectItem value="mixed">Mixed - All difficulty levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Limit */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Limit per Round: {timeLimit[0]}s
                </Label>
                <Slider
                  value={timeLimit}
                  onValueChange={setTimeLimit}
                  max={120}
                  min={30}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30s</span>
                  <span>120s</span>
                </div>
              </div>

              {/* Create Button */}
              <Button onClick={createRoom} className="w-full neon-glow" size="lg" disabled={!playerName.trim()}>
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
