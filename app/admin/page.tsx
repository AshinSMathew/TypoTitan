"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Terminal, Eye, Trophy } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Terminal className="w-10 h-10 text-primary neon-glow" />
            <h1 className="text-3xl font-bold font-mono">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Quick actions for hosting and viewing games</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-primary">Create Room</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full neon-glow" size="lg" onClick={() => router.push("/create")}>
                Create
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-accent">Spectate</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" variant="outline" onClick={() => router.push("/spectate/HACK123")}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-secondary">View Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" variant="outline" onClick={() => router.push("/results/HACK123")}>
                <Trophy className="w-4 h-4 mr-2" />
                Results
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


