"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Terminal, Users, Zap, Shield } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

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

        {/* Main Actions */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-md mx-auto mb-12">
          <Button className="w-full neon-glow" size="lg" onClick={() => router.push("/login")}>Login</Button>
          <Button variant="outline" className="w-full" size="lg" onClick={() => router.push("/signup")}>Sign up</Button>
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
                <Zap className="w-5 h-5" />
                Play and Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Improve your command skills while competing in simple, fun challenges.
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