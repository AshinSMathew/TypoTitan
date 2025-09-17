"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Users, Trophy, LogOut, Key } from "lucide-react"

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
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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

  const handleViewResults = () => {
    setShowResultsDialog(true)
    setError("")
  }

  const handleSubmitRoomCode = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Check if the room exists and has results
      const response = await fetch(`/api/results/${roomCode.trim()}`)
      const data = await response.json()
      
      if (data.success) {
        if (data.results_published) {
          // Redirect to results page
          router.push(`/results/${roomCode.trim()}`)
        } else {
          setError("Results for this room are not published yet")
        }
      } else {
        setError("Room not found or you don't have access")
      }
    } catch (error) {
      console.error("Error checking room:", error)
      setError("Failed to verify room code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono">Player Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.name}</p>
            {user.college && (
              <p className="text-sm text-muted-foreground">{user.college}</p>
            )}
          </div>
          <Button onClick={logout} variant="outline" className="flex items-center gap-2 self-center sm:self-auto">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" onClick={() => router.push("/join")}> 
                <Users className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-main flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                View Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg" 
                variant="outline" 
                onClick={handleViewResults}
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Results
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Dialog */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Enter Room Code
              </DialogTitle>
              <DialogDescription>
                Enter the room code to view the results. The admin must have published the results first.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Input
                placeholder="Enter room code (e.g., ABCD1234)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitRoomCode()
                  }
                }}
                className="text-center font-mono text-lg"
                maxLength={8}
                disabled={isLoading}
              />
              
              {error && (
                <div className="text-destructive text-sm text-center">
                  {error}
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResultsDialog(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRoomCode}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    View Results
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}