"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Terminal, Eye, Trophy, LogOut, Plus, Users, Clock,RefreshCw } from "lucide-react"

type User = {
  uid: string
  name: string
  email: string
  college: string | null
  isAdmin: boolean
}

type Room = {
  id: string
  room_key: string
  name: string
  created_by: string
  is_public: boolean
  status: string
  created_at: string
  participant_count?: number
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and is admin
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me')
        const data = await response.json()
        
        if (data.success && data.user.isAdmin) {
          setUser(data.user)
          fetchRooms()
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

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/rooms')
      const data = await response.json()
      
      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <Terminal className="w-8 h-8 md:w-10 md:h-10 text-primary neon-glow" />
              <h1 className="text-2xl md:text-3xl font-bold font-mono">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-end">
            <Button onClick={() => router.push("/create")} className="neon-glow">
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
            <Button onClick={logout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Rooms List */}
        <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary flex items-center justify-between">
              <span>Created Rooms ({rooms.length})</span>
              <Button variant="outline" size="sm" onClick={fetchRooms} disabled={loading}>
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Loading rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No rooms created yet</p>
                <Button onClick={() => router.push("/create")} className="mt-4">
                  Create Your First Room
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">{room.name}</h3>
                        <Badge variant={room.status === 'waiting' ? 'secondary' : room.status === 'in_progress' ? 'default' : 'outline'}>
                          {room.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant={room.is_public ? 'default' : 'secondary'}>
                          {room.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{room.participant_count || 0} players</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(room.created_at)}</span>
                        </div>
                        <span className="font-mono">Code: {room.room_key}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 self-end sm:self-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/spectate/${room.room_key}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Spectate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/results/${room.room_key}`)}
                        className="flex items-center gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}