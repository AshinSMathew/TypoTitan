"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Terminal, Users, Crown, Play, Copy, Check, Share2, Loader2 } from "lucide-react"

interface Player {
  id: string
  name: string
  email: string
  college: string | null
  is_host: boolean
}

interface Room {
  id: string
  room_key: string
  name: string
  created_by: string
  is_public: boolean
  status: string
  created_at: string
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const userResponse = await fetch('/api/me')
        const userData = await userResponse.json()
        
        if (!userData.success) {
          router.push('/login')
          return
        }
        
        setCurrentUser(userData.user)

        // Get room data
        const roomResponse = await fetch(`/api/room/${code}`)
        console.log(code)
        const roomData = await roomResponse.json()
        
        if (!roomData.success) {
          setError("Room not found")
          return
        }

        setRoom(roomData.room)
        setPlayers(roomData.participants)
        setIsHost(userData.user.id === roomData.room.created_by)
        
        // Connect to WebSocket server
        connectWebSocket(userData.user.id, code)
        
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load room data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      // Clean up WebSocket connection
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close()
      }
    }
  }, [code, router])

  const connectWebSocket = (userId: string, code: string) => {
    // Use environment variable for WebSocket server URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'
    const websocket = new WebSocket(`${wsUrl}?code=${code}&userId=${userId}`)
    
    websocket.onopen = () => {
      console.log("WebSocket connection established")
      ws.current = websocket
    }
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log("WebSocket message received:", data)
      
      switch (data.type) {
        case 'room_state':
          setRoom(data.room)
          setPlayers(data.participants)
          break
        case 'participant_joined':
          // Refresh room data
          fetchRoomData()
          break
        case 'participant_left':
          // Refresh room data
          fetchRoomData()
          break
        case 'game_started':
          // Redirect to game page
          router.push(`/game/${code}`)
          break
        default:
          console.log("Unknown message type:", data.type)
      }
    }
    
    websocket.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
    
    websocket.onclose = () => {
      console.log("WebSocket connection closed")
      ws.current = null
    }
  }

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/rooms/${code}`)
      const data = await response.json()
      
      if (data.success) {
        setRoom(data.room)
        setPlayers(data.participants)
      }
    } catch (error) {
      console.error("Error fetching room data:", error)
    }
  }

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareSpectatorLink = async () => {
    const spectatorUrl = `${window.location.origin}/spectate/${code}`
    try {
      await navigator.clipboard.writeText(spectatorUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy spectator link:", err)
    }
  }

  const startGame = () => {
    setCountdown(5)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer)
          
          // Send start game message via WebSocket
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
              type: 'start_game',
              code: code
            }))
          }
          
          return null
        }
        return prev! - 1
      })
    }, 1000)
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Terminal className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p>Loading room...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Terminal className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "The room you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  // Check if current user is already in the room
  const isUserInRoom = players.some(player => player.id === currentUser.id)

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Terminal className="w-8 h-8 text-primary neon-glow" />
            <div>
              <h1 className="text-3xl font-bold font-mono">{room.name}</h1>
              <p className="text-muted-foreground">
                {room.status === 'waiting' ? 'Waiting for players to join...' : 'Game in progress...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={copyRoomCode}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {code}
            </Button>
            <Button
              variant="outline"
              onClick={shareSpectatorLink}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Spectator Link
            </Button>
          </div>
        </div>


        <div className="grid lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-2">
            <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  Players ({players.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-primary">
                          <AvatarFallback className="bg-primary text-primary-foreground font-mono">
                            {player.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">{player.name}</span>
                            {player.is_host && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                HOST
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {player.college || "No college specified"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        JOINED
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Controls */}
          <div className="space-y-6">
            {/* Room Info */}
            <Card className="border-accent/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-accent">Room Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={room.status === 'waiting' ? 'default' : 'secondary'}>
                    {room.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Visibility:</span>
                  <span className="text-sm font-mono">{room.is_public ? "Public" : "Private"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm font-mono">
                    {new Date(room.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Start Game */}
            {isHost && isUserInRoom && room.status === 'waiting' && (
              <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  {countdown ? (
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary mb-2 neon-glow">{countdown}</div>
                      <p className="text-sm text-muted-foreground">Starting game...</p>
                    </div>
                  ) : (
                    <Button
                      onClick={startGame}
                      className="w-full neon-glow"
                      size="lg"
                      disabled={players.length < 1}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Challenge
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Terminal Preview */}
        <Card className="mt-8 bg-black/80 border-primary/50">
          <CardHeader>
            <CardTitle className="text-primary font-mono text-sm">root@arena:~$ preview_commands</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">{"# Sample commands you'll be typing:"}</div>
              <div className="text-primary">{"sudo netstat -tulpn"}</div>
              <div className="text-secondary">{"grep -r 'password' /var/log/"}</div>
              <div className="text-accent">{"ssh -i ~/.ssh/id_rsa user@192.168.1.100"}</div>
              <div className="text-primary typing-cursor mt-2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}