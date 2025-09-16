"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy, LogOut } from "lucide-react"

type User = {
  uid: string
  name: string
  email: string
  college: string | null
  isAdmin?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me')
        const data = await response.json()
        
        if (data.success) {
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
            <h1 className="text-3xl font-bold font-mono">Player Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button onClick={logout} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="border-accent/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-main">Join Room</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => router.push("/join")}> 
                <Users className="w-4 h-4 mr-2" />
                Join
              </Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-main">View Results</CardTitle>
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