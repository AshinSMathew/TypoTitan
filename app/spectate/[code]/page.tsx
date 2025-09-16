"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Users, Home, RefreshCw } from "lucide-react"

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

interface GameState {
  currentLevel: "easy" | "medium" | "hard"
  isActive: boolean
  timeLeft: number
}

export default function SpectatePage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: "easy",
    isActive: false,
    timeLeft: 300
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchSpectateData()
    
    // Set up real-time updates every 3 seconds
    const interval = setInterval(fetchSpectateData, 3000)
    
    return () => clearInterval(interval)
  }, [roomCode])

  const fetchSpectateData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/spectate/${roomCode}`)
      const data = await response.json()
      
      if (data.success) {
        setPlayers(data.players)
        setGameState(data.gameState)
      }
    } catch (error) {
      console.error("Error fetching spectate data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "hard":
        return "text-red-500"
      default:
        return "text-foreground"
    }
  }

  const getPlayerRank = (playerId: string) => {
    const sortedPlayers = [...players].sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress
      if (b.wpm !== a.wpm) return b.wpm - a.wpm
      return a.errors - b.errors
    })
    return sortedPlayers.findIndex((p) => p.id === playerId) + 1
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const focusedPlayer = selectedPlayer ? players.find((p) => p.id === selectedPlayer) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p>Loading spectator data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Eye className="w-6 h-6 md:w-8 md:h-8 text-accent neon-glow" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-mono">Spectator Mode</h1>
              <p className="text-sm text-muted-foreground">Watching Arena: {roomCode}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <Badge variant="outline" className={`border-current ${getDifficultyColor(gameState.currentLevel)}`}>
              {gameState.currentLevel.toUpperCase()} LEVEL
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              Time: <span className="font-mono">{formatTime(gameState.timeLeft)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSpectateData}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main View */}
          <div className="lg:col-span-3 space-y-6">
            {/* Player Focus View */}
            {focusedPlayer && (
              <Card className="border-accent/50 bg-black/80">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-accent font-mono text-sm">
                      Watching: {focusedPlayer.name} (Rank #{getPlayerRank(focusedPlayer.id)})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPlayer(null)}
                      className="text-muted-foreground hover:text-foreground self-start sm:self-auto"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-base md:text-lg mb-4 break-all">
                    {focusedPlayer.currentCommand.split("").map((char, index) => (
                      <span
                        key={index}
                        className={
                          index < focusedPlayer.currentCommand.length * (focusedPlayer.progress / 100)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                    <div className="bg-primary/10 p-2 rounded">
                      <div className="text-primary font-bold text-lg md:text-xl">{focusedPlayer.wpm}</div>
                      <div className="text-xs text-muted-foreground">WPM</div>
                    </div>
                    <div className="bg-secondary/10 p-2 rounded">
                      <div className="text-secondary font-bold text-lg md:text-xl">{focusedPlayer.accuracy}%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="bg-accent/10 p-2 rounded">
                      <div className="text-accent font-bold text-lg md:text-xl">{Math.round(focusedPlayer.progress)}%</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                    <div className="bg-destructive/10 p-2 rounded">
                      <div className="text-destructive font-bold text-lg md:text-xl">{focusedPlayer.errors}</div>
                      <div className="text-xs text-muted-foreground">Errors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Rankings */}
            <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                  <Users className="w-5 h-5" />
                  Live Competition ({players.length} players)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {players.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No players in this room yet</p>
                  </div>
                ) : (
                  players
                    .sort((a, b) => {
                      if (b.progress !== a.progress) return b.progress - a.progress
                      if (b.wpm !== a.wpm) return b.wpm - a.wpm
                      return a.errors - b.errors
                    })
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={`p-3 md:p-4 rounded border cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedPlayer === player.id
                            ? "border-accent bg-accent/10"
                            : "border-border bg-muted/20 hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPlayer(player.id)}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="text-base md:text-lg font-bold text-primary">#{index + 1}</div>
                          <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                              {player.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                              <span className="font-bold text-sm md:text-base truncate">{player.name}</span>
                              {selectedPlayer === player.id && (
                                <Badge variant="secondary" className="text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Watching
                                </Badge>
                              )}
                              {player.isFinished && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  Finished
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground mb-2">
                              {player.wpm} WPM • {player.accuracy}% • {player.errors} errors
                            </div>
                            <Progress value={player.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Spectator Info Sidebar */}
          <div className="space-y-4">
            

            <Card className="border-accent/30 bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-accent text-sm">Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Active Players:</span>
                  <span className="font-mono">{players.filter(p => !p.isFinished).length}/{players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg WPM:</span>
                  <span className="font-mono">
                    {players.length > 0 ? Math.round(players.reduce((acc, p) => acc + p.wpm, 0) / players.length) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Accuracy:</span>
                  <span className="font-mono">
                    {players.length > 0 ? Math.round(players.reduce((acc, p) => acc + p.accuracy, 0) / players.length) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Left:</span>
                  <span className="font-mono">{formatTime(gameState.timeLeft)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-primary text-sm">Room Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={gameState.isActive ? "default" : "secondary"} className="text-xs">
                    {gameState.isActive ? "ACTIVE" : "WAITING"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <span className="font-mono capitalize">{gameState.currentLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Code:</span>
                  <span className="font-mono">{roomCode}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}