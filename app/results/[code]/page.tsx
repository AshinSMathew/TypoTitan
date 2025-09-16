"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Target, Zap, Clock, Home, RotateCcw, Users, Loader2 } from "lucide-react"

interface PlayerResult {
  id: string
  name: string
  wpm: number
  accuracy: number
  completionTime: number
  rank: number
  totalErrors: number
}

interface User {
  uid: string
  name: string
  email: string
  isAdmin: boolean
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string
  const [results, setResults] = useState<PlayerResult[]>([])
  const [resultsPublished, setResultsPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    fetchResults()
    fetchCurrentUser()
  }, [roomCode])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/me')
      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  }

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/results/${roomCode}`)
      const data = await response.json()
      
      if (data.success) {
        setResultsPublished(data.results_published)
        if (data.results_published && data.players) {
          setResults(data.players)
        }
      }
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  const publishResults = async () => {
    try {
      setPublishing(true)
      const response = await fetch(`/api/results/${roomCode}/publish`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResultsPublished(true)
        // Refetch results to get the published data
        fetchResults()
      }
    } catch (error) {
      console.error("Error publishing results:", error)
    } finally {
      setPublishing(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
      default:
        return <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-sm font-bold">#{rank}</div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  if (!resultsPublished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="border-primary/50 bg-card/50 backdrop-blur-sm max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Results Pending</h1>
            <p className="text-muted-foreground mb-6">
              Waiting for the admin to publish the results. Please check back later.
            </p>
            
            {currentUser?.isAdmin && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You are an admin. You can publish the results now.
                </p>
                <Button 
                  onClick={publishResults} 
                  disabled={publishing}
                  className="w-full neon-glow"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Results"
                  )}
                </Button>
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => router.push(`/room/${roomCode}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Back to Room
                  </Button>
                  <Button
                    onClick={() => router.push("/admin")}
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 md:w-12 md:h-12 text-primary neon-glow" />
            <h1 className="text-2xl md:text-4xl font-bold font-mono">Challenge Complete!</h1>
          </div>
          <p className="text-muted-foreground">Arena: {roomCode}</p>
          
          {currentUser?.isAdmin && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm">
                Admin View
              </Badge>
            </div>
          )}
        </div>

        {/* Podium */}
        {results.length >= 3 && (
          <div className="max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              {results[1] && (
                <Card className={`${getRankColor(2)} backdrop-blur-sm order-1 md:order-1`}>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4">{getRankIcon(2)}</div>
                    <Avatar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 border-2 border-gray-400">
                      <AvatarFallback className="bg-gray-400 text-white text-sm md:text-lg">
                        {results[1].name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-base md:text-lg">{results[1].name}</h3>
                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                      <div>{results[1].wpm} WPM</div>
                      <div>{results[1].accuracy}% Accuracy</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 1st Place */}
              {results[0] && (
                <Card className={`${getRankColor(1)} backdrop-blur-sm order-2 md:order-2 md:scale-110`}>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4 neon-glow">{getRankIcon(1)}</div>
                    <Avatar className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 border-4 border-yellow-400 neon-glow">
                      <AvatarFallback className="bg-yellow-400 text-black text-base md:text-xl font-bold">
                        {results[0].name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg md:text-xl text-yellow-400">{results[0].name}</h3>
                    <Badge className="mb-2 bg-yellow-400 text-black text-xs">CHAMPION</Badge>
                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                      <div className="text-yellow-400 font-bold">{results[0].wpm} WPM</div>
                      <div>{results[0].accuracy}% Accuracy</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 3rd Place */}
              {results[2] && (
                <Card className={`${getRankColor(3)} backdrop-blur-sm order-3 md:order-3`}>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4">{getRankIcon(3)}</div>
                    <Avatar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 border-2 border-amber-600">
                      <AvatarFallback className="bg-amber-600 text-white text-sm md:text-lg">
                        {results[2].name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-base md:text-lg">{results[2].name}</h3>
                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                      <div>{results[2].wpm} WPM</div>
                      <div>{results[2].accuracy}% Accuracy</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Detailed Results */}
        <div className="max-w-4xl mx-auto space-y-4 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6">Detailed Results</h2>
          {results.length === 0 ? (
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">No players have completed the challenge yet.</p>
              </CardContent>
            </Card>
          ) : (
            results.map((player) => (
              <Card key={player.id} className={`${getRankColor(player.rank)} backdrop-blur-sm`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(player.rank)}
                        <span className="text-xl md:text-2xl font-bold">#{player.rank}</span>
                      </div>
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm md:text-base">
                          {player.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold">{player.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 text-center">
                    <div className="bg-primary/10 p-2 rounded">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <Zap className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm font-medium">WPM</span>
                      </div>
                      <div className="text-xl md:text-2xl font-bold">{player.wpm}</div>
                    </div>
                    <div className="bg-secondary/10 p-2 rounded">
                      <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                        <Target className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm font-medium">Accuracy</span>
                      </div>
                      <div className="text-xl md:text-2xl font-bold">{player.accuracy}%</div>
                    </div>
                    <div className="bg-accent/10 p-2 rounded">
                      <div className="flex items-center justify-center gap-1 text-accent mb-1">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm font-medium">Time</span>
                      </div>
                      <div className="text-xl md:text-2xl font-bold">{player.completionTime}s</div>
                    </div>
                    <div className="bg-destructive/10 p-2 rounded">
                      <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Errors</div>
                      <div className="text-xl md:text-2xl font-bold text-destructive">{player.totalErrors}</div>
                    </div>
                    <div className="bg-primary/20 p-2 rounded">
                      <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Score</div>
                      <div className="text-xl md:text-2xl font-bold text-primary">
                        {Math.round((player.wpm * player.accuracy) / 100)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
          <Button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  )
}