"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Target, Zap, Clock, Home, RotateCcw } from "lucide-react"

interface PlayerResult {
  id: string
  name: string
  wpm: number
  accuracy: number
  completionTime: number
  rank: number
  totalErrors: number
  achievements: string[]
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string

  const [results] = useState<PlayerResult[]>([
    {
      id: "1",
      name: "CyberHacker",
      wpm: 67,
      accuracy: 94,
      completionTime: 145,
      rank: 1,
      totalErrors: 8,
      achievements: ["Speed Demon", "Accuracy Master"],
    },
    {
      id: "2",
      name: "CodeNinja",
      wpm: 58,
      accuracy: 97,
      completionTime: 162,
      rank: 2,
      totalErrors: 4,
      achievements: ["Precision Expert", "Error-Free Streak"],
    },
    {
      id: "3",
      name: "TerminalMaster",
      wpm: 45,
      accuracy: 89,
      completionTime: 178,
      rank: 3,
      totalErrors: 12,
      achievements: ["Persistent Hacker"],
    },
  ])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-sm font-bold">#{rank}</div>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-400/50 bg-yellow-400/10"
      case 2:
        return "border-gray-400/50 bg-gray-400/10"
      case 3:
        return "border-amber-600/50 bg-amber-600/10"
      default:
        return "border-border bg-card/50"
    }
  }

  const getAchievementColor = (achievement: string) => {
    switch (achievement) {
      case "Speed Demon":
        return "bg-primary text-primary-foreground"
      case "Accuracy Master":
        return "bg-secondary text-secondary-foreground"
      case "Precision Expert":
        return "bg-accent text-accent-foreground"
      case "Error-Free Streak":
        return "bg-green-500 text-white"
      case "Persistent Hacker":
        return "bg-purple-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-primary neon-glow" />
            <h1 className="text-4xl font-bold font-mono">Challenge Complete!</h1>
          </div>
          <p className="text-muted-foreground">Arena: {roomCode}</p>
        </div>

        {/* Podium */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            {results[1] && (
              <Card className={`${getRankColor(2)} backdrop-blur-sm order-1 md:order-1`}>
                <CardContent className="pt-6 text-center">
                  <div className="mb-4">{getRankIcon(2)}</div>
                  <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-gray-400">
                    <AvatarFallback className="bg-gray-400 text-white text-lg">
                      {results[1].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{results[1].name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{results[1].wpm} WPM</div>
                    <div>{results[1].accuracy}% Accuracy</div>
                    <div>{results[1].completionTime}s</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 1st Place */}
            {results[0] && (
              <Card className={`${getRankColor(1)} backdrop-blur-sm order-2 md:order-2 md:scale-110`}>
                <CardContent className="pt-6 text-center">
                  <div className="mb-4 neon-glow">{getRankIcon(1)}</div>
                  <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-yellow-400 neon-glow">
                    <AvatarFallback className="bg-yellow-400 text-black text-xl font-bold">
                      {results[0].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl text-yellow-400">{results[0].name}</h3>
                  <Badge className="mb-2 bg-yellow-400 text-black">CHAMPION</Badge>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="text-yellow-400 font-bold">{results[0].wpm} WPM</div>
                    <div>{results[0].accuracy}% Accuracy</div>
                    <div>{results[0].completionTime}s</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3rd Place */}
            {results[2] && (
              <Card className={`${getRankColor(3)} backdrop-blur-sm order-3 md:order-3`}>
                <CardContent className="pt-6 text-center">
                  <div className="mb-4">{getRankIcon(3)}</div>
                  <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-amber-600">
                    <AvatarFallback className="bg-amber-600 text-white text-lg">
                      {results[2].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{results[2].name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{results[2].wpm} WPM</div>
                    <div>{results[2].accuracy}% Accuracy</div>
                    <div>{results[2].completionTime}s</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="max-w-4xl mx-auto space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Detailed Results</h2>
          {results.map((player) => (
            <Card key={player.id} className={`${getRankColor(player.rank)} backdrop-blur-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(player.rank)}
                      <span className="text-2xl font-bold">#{player.rank}</span>
                    </div>
                    <Avatar className="w-12 h-12 border-2 border-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {player.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{player.name}</h3>
                      <div className="flex gap-2 mt-1">
                        {player.achievements.map((achievement) => (
                          <Badge key={achievement} className={getAchievementColor(achievement)} variant="secondary">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">WPM</span>
                    </div>
                    <div className="text-2xl font-bold">{player.wpm}</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold">{player.accuracy}%</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-accent mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Time</span>
                    </div>
                    <div className="text-2xl font-bold">{player.completionTime}s</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Errors</div>
                    <div className="text-2xl font-bold text-destructive">{player.totalErrors}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Score</div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((player.wpm * player.accuracy) / 100)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => router.push(`/room/${roomCode}`)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button onClick={() => router.push("/")} className="neon-glow">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
