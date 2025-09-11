"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Award, Zap, Target, Clock, TrendingUp, Users, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface LeaderboardEntry {
  id: string
  name: string
  wpm: number
  accuracy: number
  gamesPlayed: number
  winRate: number
  bestTime: number
  totalScore: number
  rank: number
  trend: "up" | "down" | "stable"
  achievements: string[]
  lastPlayed: string
}

interface RecentGame {
  id: string
  roomCode: string
  date: string
  players: number
  winner: string
  avgWpm: number
  duration: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [timeFilter, setTimeFilter] = useState("all-time")
  const [sortBy, setSortBy] = useState("totalScore")

  const [globalLeaderboard] = useState<LeaderboardEntry[]>([
    {
      id: "1",
      name: "CyberLegend",
      wpm: 89,
      accuracy: 97,
      gamesPlayed: 156,
      winRate: 78,
      bestTime: 98,
      totalScore: 8633,
      rank: 1,
      trend: "up",
      achievements: ["Speed Demon", "Accuracy Master", "Champion", "Streak Master"],
      lastPlayed: "2 hours ago",
    },
    {
      id: "2",
      name: "TerminalGod",
      wpm: 84,
      accuracy: 95,
      gamesPlayed: 203,
      winRate: 72,
      bestTime: 102,
      totalScore: 7980,
      rank: 2,
      trend: "stable",
      achievements: ["Precision Expert", "Marathon Runner", "Consistent Performer"],
      lastPlayed: "5 hours ago",
    },
    {
      id: "3",
      name: "HackMaster",
      wpm: 81,
      accuracy: 93,
      gamesPlayed: 134,
      winRate: 69,
      bestTime: 105,
      totalScore: 7533,
      rank: 3,
      trend: "down",
      achievements: ["Speed Demon", "Veteran", "Top Performer"],
      lastPlayed: "1 day ago",
    },
    {
      id: "4",
      name: "CodeNinja",
      wpm: 78,
      accuracy: 96,
      gamesPlayed: 98,
      winRate: 74,
      bestTime: 108,
      totalScore: 7488,
      rank: 4,
      trend: "up",
      achievements: ["Accuracy Master", "Rising Star"],
      lastPlayed: "3 hours ago",
    },
    {
      id: "5",
      name: "CyberHacker",
      wpm: 76,
      accuracy: 91,
      gamesPlayed: 87,
      winRate: 65,
      bestTime: 112,
      totalScore: 6916,
      rank: 5,
      trend: "up",
      achievements: ["Persistent Hacker", "Improvement"],
      lastPlayed: "30 minutes ago",
    },
  ])

  const [recentGames] = useState<RecentGame[]>([
    {
      id: "1",
      roomCode: "HACK123",
      date: "2 hours ago",
      players: 4,
      winner: "CyberLegend",
      avgWpm: 67,
      duration: 145,
    },
    {
      id: "2",
      roomCode: "TERM456",
      date: "4 hours ago",
      players: 6,
      winner: "TerminalGod",
      avgWpm: 72,
      duration: 138,
    },
    {
      id: "3",
      roomCode: "CODE789",
      date: "6 hours ago",
      players: 3,
      winner: "CodeNinja",
      avgWpm: 58,
      duration: 167,
    },
    {
      id: "4",
      roomCode: "CYBER01",
      date: "8 hours ago",
      players: 8,
      winner: "HackMaster",
      avgWpm: 74,
      duration: 142,
    },
  ])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400 neon-glow" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">
            #{rank}
          </div>
        )
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default:
        return <div className="w-4 h-4 bg-muted-foreground rounded-full" />
    }
  }

  const getAchievementColor = (achievement: string) => {
    const colors = {
      "Speed Demon": "bg-primary text-primary-foreground",
      "Accuracy Master": "bg-secondary text-secondary-foreground",
      Champion: "bg-yellow-500 text-black",
      "Streak Master": "bg-purple-500 text-white",
      "Precision Expert": "bg-accent text-accent-foreground",
      "Marathon Runner": "bg-blue-500 text-white",
      "Consistent Performer": "bg-green-500 text-white",
      Veteran: "bg-orange-500 text-white",
      "Top Performer": "bg-red-500 text-white",
      "Rising Star": "bg-pink-500 text-white",
      "Persistent Hacker": "bg-indigo-500 text-white",
      Improvement: "bg-teal-500 text-white",
    }
    return colors[achievement as keyof typeof colors] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-primary neon-glow" />
            <h1 className="text-4xl font-bold font-mono glitch" data-text="Global Leaderboard">
              Global Leaderboard
            </h1>
          </div>
          <p className="text-muted-foreground">Top cybersecurity typing champions from around the world</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="daily">Today</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalScore">Total Score</SelectItem>
                <SelectItem value="wpm">WPM</SelectItem>
                <SelectItem value="accuracy">Accuracy</SelectItem>
                <SelectItem value="winRate">Win Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => router.push("/")} variant="outline" className="border-primary text-primary">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/20">
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Global Rankings
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Recent Games
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            {/* Top 3 Podium */}
            <div className="grid md:grid-cols-3 gap-4 items-end mb-8">
              {/* 2nd Place */}
              {globalLeaderboard[1] && (
                <Card className={`${getRankColor(2)} backdrop-blur-sm order-1 md:order-1`}>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4">{getRankIcon(2)}</div>
                    <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-gray-400">
                      <AvatarFallback className="bg-gray-400 text-white text-lg">
                        {globalLeaderboard[1].name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{globalLeaderboard[1].name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{globalLeaderboard[1].wpm} WPM</div>
                      <div>{globalLeaderboard[1].accuracy}% Accuracy</div>
                      <div className="text-xs">{globalLeaderboard[1].totalScore} pts</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 1st Place */}
              {globalLeaderboard[0] && (
                <Card className={`${getRankColor(1)} backdrop-blur-sm order-2 md:order-2 md:scale-110`}>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4">{getRankIcon(1)}</div>
                    <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-yellow-400 neon-glow">
                      <AvatarFallback className="bg-yellow-400 text-black text-xl font-bold">
                        {globalLeaderboard[0].name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-xl text-yellow-400">{globalLeaderboard[0].name}</h3>
                    <Badge className="mb-2 bg-yellow-400 text-black neon-glow">CHAMPION</Badge>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="text-yellow-400 font-bold">{globalLeaderboard[0].wpm} WPM</div>
                      <div>{globalLeaderboard[0].accuracy}% Accuracy</div>
                      <div className="text-xs">{globalLeaderboard[0].totalScore} pts</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 3rd Place */}
              {globalLeaderboard[2] && (
                <Card className={`${getRankColor(3)} backdrop-blur-sm order-3 md:order-3`}>
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4">{getRankIcon(3)}</div>
                    <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-amber-600">
                      <AvatarFallback className="bg-amber-600 text-white text-lg">
                        {globalLeaderboard[2].name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{globalLeaderboard[2].name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{globalLeaderboard[2].wpm} WPM</div>
                      <div>{globalLeaderboard[2].accuracy}% Accuracy</div>
                      <div className="text-xs">{globalLeaderboard[2].totalScore} pts</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Full Leaderboard */}
            <div className="space-y-3">
              {globalLeaderboard.map((player) => (
                <Card
                  key={player.id}
                  className={`${getRankColor(player.rank)} backdrop-blur-sm hover:scale-[1.02] transition-transform`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(player.rank)}
                          {getTrendIcon(player.trend)}
                        </div>
                        <Avatar className="w-12 h-12 border-2 border-primary">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {player.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold">{player.name}</h3>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {player.achievements.slice(0, 3).map((achievement) => (
                              <Badge key={achievement} className={`${getAchievementColor(achievement)} text-xs`}>
                                {achievement}
                              </Badge>
                            ))}
                            {player.achievements.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{player.achievements.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center text-sm">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-primary mb-1">
                            <Zap className="w-3 h-3" />
                            <span className="font-medium">WPM</span>
                          </div>
                          <div className="font-bold">{player.wpm}</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                            <Target className="w-3 h-3" />
                            <span className="font-medium">ACC</span>
                          </div>
                          <div className="font-bold">{player.accuracy}%</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-accent mb-1">
                            <Trophy className="w-3 h-3" />
                            <span className="font-medium">WIN</span>
                          </div>
                          <div className="font-bold">{player.winRate}%</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">BEST</span>
                          </div>
                          <div className="font-bold">{player.bestTime}s</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1 font-medium">GAMES</div>
                          <div className="font-bold">{player.gamesPlayed}</div>
                        </div>
                        <div>
                          <div className="text-primary mb-1 font-medium">SCORE</div>
                          <div className="font-bold text-primary">{player.totalScore}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid gap-4">
              {recentGames.map((game) => (
                <Card key={game.id} className="border-accent/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold font-mono text-accent">{game.roomCode}</div>
                          <div className="text-xs text-muted-foreground">{game.date}</div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="font-bold">{game.winner}</span>
                            <Badge variant="secondary">Winner</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {game.players} players
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {game.avgWpm} avg WPM
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {game.duration}s
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
