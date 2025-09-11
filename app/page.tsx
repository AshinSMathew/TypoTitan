"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Terminal, Users, Trophy, Zap, Shield, Code, TrendingUp } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [playerName, setPlayerName] = useState("")

  const handleCreateRoom = () => {
    if (!playerName.trim()) return
    router.push(`/create?name=${encodeURIComponent(playerName)}`)
  }

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return
    router.push(`/join?name=${encodeURIComponent(playerName)}&code=${roomCode}`)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-secondary rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-ping"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Terminal className="w-12 h-12 text-primary neon-glow" />
            <h1 className="text-6xl font-bold font-mono glitch" data-text="CyberType">
              CyberType
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master cybersecurity commands through competitive typing challenges. Test your skills in real-time
            multiplayer battles.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="secondary" className="neon-glow">
              <Shield className="w-4 h-4 mr-1" />
              Cybersecurity Focus
            </Badge>
            <Badge variant="outline" className="border-accent text-accent">
              <Users className="w-4 h-4 mr-1" />
              Multiplayer
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              <Zap className="w-4 h-4 mr-1" />
              Real-time
            </Badge>
          </div>
        </header>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Create Room Card */}
          <Card className="border-primary/50 bg-card/50 backdrop-blur-sm hover:border-primary transition-all duration-300 neon-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Code className="w-6 h-6" />
                Create Room
              </CardTitle>
              <CardDescription>Start a new typing arena and invite friends to compete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-input border-border focus:border-primary"
              />
              <Button
                className="w-full neon-glow hover:scale-105 transition-transform"
                size="lg"
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
              >
                Create Arena
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="border-accent/50 bg-card/50 backdrop-blur-sm hover:border-accent transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Users className="w-6 h-6" />
                Join Room
              </CardTitle>
              <CardDescription>Enter a room code to join an existing typing challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-input border-border focus:border-accent"
              />
              <Input
                placeholder="Room Code (e.g., HACK123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="bg-input border-border focus:border-accent font-mono"
              />
              <Button
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                size="lg"
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomCode.trim()}
              >
                Join Arena
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-12">
          <Button
            onClick={() => router.push("/leaderboard")}
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground neon-glow"
            size="lg"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            View Global Leaderboard
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-secondary/30 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <Terminal className="w-5 h-5" />
                Command Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Type real cybersecurity commands, Linux tools, and network utilities across three difficulty levels.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="w-5 h-5" />
                Real-time Competition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compete with up to 8 players simultaneously with live progress tracking and instant feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Trophy className="w-5 h-5" />
                Dynamic Leaderboards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earn rankings based on WPM, accuracy, and completion time with achievement badges.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Terminal Preview */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-black/80 border-primary/50">
            <CardHeader>
              <CardTitle className="text-primary font-mono text-sm">root@cybertype:~$ preview_challenge</CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-sm">
              <div className="space-y-2">
                <div className="text-muted-foreground"># Easy Level Example:</div>
                <div className="text-primary">ls -la /etc/passwd</div>
                <div className="text-muted-foreground"># Medium Level Example:</div>
                <div className="text-secondary">nmap -sS -O target.com</div>
                <div className="text-muted-foreground"># Hard Level Example:</div>
                <div className="text-accent">openssl enc -aes-256-cbc -salt -in file.txt -out file.enc</div>
                <div className="text-primary typing-cursor mt-4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
