"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">Player Dashboard</h1>
          <p className="text-muted-foreground">Join rooms and view results</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="border-accent/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-accent">Join Room</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => router.push("/join")}>Join</Button>
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


