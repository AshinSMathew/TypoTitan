"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChatPanel } from "@/components/chat-panel"
import { Terminal, Users, Crown, Play, Copy, Check, Share2 } from "lucide-react"

interface Player {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string
  const [players] = useState<Player[]>([
    { id: "1", name: "CyberHacker", isHost: true, isReady: true },
    { id: "2", name: "TerminalMaster", isHost: false, isReady: false },
    { id: "3", name: "CodeNinja", isHost: false, isReady: true },
  ])
  const [isHost] = useState(true)
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareSpectatorLink = async () => {
    const spectatorUrl = `${window.location.origin}/spectate/${roomCode}`
    try {
      await navigator.clipboard.writeText(spectatorUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy spectator link:", err)
    }
  }

  const startGame = () => {
    setCountdown(5)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer)
          router.push(`/game/${roomCode}`)
          return null
        }
        return prev! - 1
      })
    }, 1000)
  }

  const toggleReady = () => {
    // In a real app, this would update the player's ready status
    console.log("Toggle ready status")
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Terminal className="w-8 h-8 text-primary neon-glow" />
            <div>
              <h1 className="text-3xl font-bold font-mono">Cyber Arena</h1>
              <p className="text-muted-foreground">Waiting for players to join...</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={copyRoomCode}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {roomCode}
            </Button>
            <Button
              variant="outline"
              onClick={shareSpectatorLink}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Spectator Link
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-2">
            <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  Players ({players.length}/8)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-primary">
                          <AvatarFallback className="bg-primary text-primary-foreground font-mono">
                            {player.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">{player.name}</span>
                            {player.isHost && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                HOST
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {player.isReady ? "Ready to hack" : "Preparing terminal..."}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={player.isReady ? "default" : "outline"}
                        className={player.isReady ? "bg-primary text-primary-foreground" : ""}
                      >
                        {player.isReady ? "READY" : "NOT READY"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Controls */}
          <div className="space-y-6">
            {/* Ready Status */}
            <Card className="border-accent/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-accent">Your Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={toggleReady}
                  className="w-full mb-4"
                  variant={players.find((p) => p.id === "1")?.isReady ? "default" : "outline"}
                >
                  {players.find((p) => p.id === "1")?.isReady ? "READY" : "GET READY"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">Click to toggle your ready status</p>
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-secondary">Challenge Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Difficulty Levels:</span>
                  <span className="text-sm font-mono">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Commands per Level:</span>
                  <span className="text-sm font-mono">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Time Limit:</span>
                  <span className="text-sm font-mono">60s</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Type cybersecurity commands as fast and accurately as possible!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Start Game */}
            {isHost && (
              <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  {countdown ? (
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary mb-2 neon-glow">{countdown}</div>
                      <p className="text-sm text-muted-foreground">Starting game...</p>
                    </div>
                  ) : (
                    <Button
                      onClick={startGame}
                      className="w-full neon-glow"
                      size="lg"
                      disabled={players.filter((p) => p.isReady).length < 2}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Challenge
                    </Button>
                  )}
                  {players.filter((p) => p.isReady).length < 2 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">Need at least 2 ready players</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Terminal Preview */}
        <Card className="mt-8 bg-black/80 border-primary/50">
          <CardHeader>
            <CardTitle className="text-primary font-mono text-sm">root@arena:~$ preview_commands</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">{"# Sample commands you'll be typing:"}</div>
              <div className="text-primary">{"sudo netstat -tulpn"}</div>
              <div className="text-secondary">{"grep -r 'password' /var/log/"}</div>
              <div className="text-accent">{"ssh -i ~/.ssh/id_rsa user@192.168.1.100"}</div>
              <div className="text-primary typing-cursor mt-2"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChatPanel roomCode={roomCode} currentUser="CyberHacker" />
    </div>
  )
}
