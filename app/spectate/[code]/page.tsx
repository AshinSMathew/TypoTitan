"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChatPanel } from "@/components/chat-panel"
import { Eye, Users, Clock, Home, Volume2, VolumeX } from "lucide-react"

interface Player {
  id: string
  name: string
  wpm: number
  accuracy: number
  progress: number
  isFinished: boolean
  currentCommand: string
  errors: number
}

export default function SpectatePage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  const [gameState] = useState({
    currentLevel: "medium" as "easy" | "medium" | "hard",
    timeLeft: 45,
    isActive: true,
  })

  const [players] = useState<Player[]>([
    {
      id: "1",
      name: "CyberHacker",
      wpm: 67,
      accuracy: 94,
      progress: 75,
      isFinished: false,
      currentCommand: "nmap -sS -O target.com",
      errors: 2,
    },
    {
      id: "2",
      name: "TerminalMaster",
      wpm: 58,
      accuracy: 88,
      progress: 65,
      isFinished: false,
      currentCommand: "netstat -tulpn | grep LISTEN",
      errors: 5,
    },
    {
      id: "3",
      name: "CodeNinja",
      wpm: 72,
      accuracy: 96,
      progress: 80,
      isFinished: false,
      currentCommand: 'grep -r "password" /var/log/',
      errors: 1,
    },
  ])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-primary"
      case "medium":
        return "text-secondary"
      case "hard":
        return "text-accent"
      default:
        return "text-foreground"
    }
  }

  const getPlayerRank = (playerId: string) => {
    const sortedPlayers = [...players].sort((a, b) => b.progress - a.progress)
    return sortedPlayers.findIndex((p) => p.id === playerId) + 1
  }

  const focusedPlayer = selectedPlayer ? players.find((p) => p.id === selectedPlayer) : null

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Eye className="w-8 h-8 text-accent neon-glow" />
            <div>
              <h1 className="text-2xl font-bold font-mono">Spectator Mode</h1>
              <p className="text-sm text-muted-foreground">Watching Arena: {roomCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={`border-current ${getDifficultyColor(gameState.currentLevel)}`}>
              {gameState.currentLevel.toUpperCase()} LEVEL
            </Badge>
            <div className="flex items-center gap-2 text-destructive">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg">{gameState.timeLeft}s</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-muted-foreground hover:text-foreground"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main View */}
          <div className="lg:col-span-3 space-y-6">
            {/* Player Focus View */}
            {focusedPlayer && (
              <Card className="border-accent/50 bg-black/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-accent font-mono text-sm">
                      Watching: {focusedPlayer.name} (Rank #{getPlayerRank(focusedPlayer.id)})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPlayer(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-lg mb-4">
                    {focusedPlayer.currentCommand.split("").map((char, index) => (
                      <span
                        key={index}
                        className={
                          index < focusedPlayer.currentCommand.length * (focusedPlayer.progress / 100)
                            ? "text-primary bg-primary/20"
                            : "text-muted-foreground"
                        }
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="text-primary font-bold text-xl">{focusedPlayer.wpm}</div>
                      <div className="text-xs text-muted-foreground">WPM</div>
                    </div>
                    <div>
                      <div className="text-secondary font-bold text-xl">{focusedPlayer.accuracy}%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-accent font-bold text-xl">{Math.round(focusedPlayer.progress)}%</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                    <div>
                      <div className="text-destructive font-bold text-xl">{focusedPlayer.errors}</div>
                      <div className="text-xs text-muted-foreground">Errors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Rankings */}
            <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  Live Competition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {players
                  .sort((a, b) => b.progress - a.progress)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded border cursor-pointer transition-all hover:scale-[1.02] ${
                        selectedPlayer === player.id
                          ? "border-accent bg-accent/10"
                          : "border-border bg-muted/20 hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPlayer(player.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-primary">#{index + 1}</div>
                        <Avatar className="w-10 h-10 border-2 border-primary">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {player.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{player.name}</span>
                            {selectedPlayer === player.id && (
                              <Badge variant="secondary" className="text-xs">
                                <Eye className="w-3 h-3 mr-1" />
                                Watching
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {player.wpm} WPM • {player.accuracy}% • {player.errors} errors
                          </div>
                          <Progress value={player.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Spectator Info Sidebar */}
          <div className="space-y-4">
            <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-secondary text-sm">Spectator Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Sound Effects:</span>
                  <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="h-6 px-2">
                    {soundEnabled ? "ON" : "OFF"}
                  </Button>
                </div>
                <div className="flex justify-between">
                  <span>Auto-follow Leader:</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    OFF
                  </Button>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Click on any player to focus on their typing progress in real-time.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-accent text-sm">Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Active Players:</span>
                  <span className="font-mono">{players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average WPM:</span>
                  <span className="font-mono">
                    {Math.round(players.reduce((acc, p) => acc + p.wpm, 0) / players.length)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Accuracy:</span>
                  <span className="font-mono">
                    {Math.round(players.reduce((acc, p) => acc + p.accuracy, 0) / players.length)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Game Duration:</span>
                  <span className="font-mono">2:15</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel roomCode={roomCode} currentUser="Spectator" isSpectator={true} />
    </div>
  )
}
