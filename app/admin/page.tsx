"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Terminal, Eye, Trophy, LogOut } from "lucide-react"

type User = {
  uid: string
  name: string
  email: string
  college: string | null
  isAdmin: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is authenticated and is admin
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me')
        const data = await response.json()
        
        if (data.success && data.user.isAdmin) {
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Terminal className="w-10 h-10 text-primary neon-glow" />
              <h1 className="text-3xl font-bold font-mono">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button onClick={logout} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
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
              <Button className="w-full" size="lg" variant="outline" onClick={() => router.push("/spectate")}>
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
              <Button className="w-full" size="lg" variant="outline" onClick={() => router.push("/results")}>
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