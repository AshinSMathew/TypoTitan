"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Terminal, Users, Crown, Play, Copy, Check } from "lucide-react"

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
  type AuthUser = {
    uid?: string
    id?: string
    email?: string
    name?: string
  }
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const unsubRoomRef = useRef<null | (() => void)>(null)
  const unsubPartsRef = useRef<null | (() => void)>(null)

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
        setIsHost((userData.user.uid || userData.user.id) === roomData.room.created_by)

        // Start Firestore realtime listeners
        startRealtime(code)
        // Ensure user is joined
        await fetch(`/api/room/${code}/join`, { method: 'POST' })
        
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load room data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      stopRealtime()
    }
  }, [code, router])

  const startRealtime = (code: string) => {
    import('@/lib/firebaseClient').then(({ clientDb }) => {
      // Import Firestore APIs from the module to ensure proper types and instances
      import('firebase/firestore').then(({ doc, onSnapshot, collection, query }) => {
        const roomDoc = doc(clientDb, 'rooms', code)
        const partsQ = query(collection(doc(clientDb, 'rooms', code), 'participants'))
        unsubRoomRef.current = onSnapshot(roomDoc, (snap) => {
          if (snap.exists()) setRoom(snap.data() as Room)
        })
        unsubPartsRef.current = onSnapshot(partsQ, (snap) => {
          const list = snap.docs.map((d) => d.data() as Player)
          setPlayers(list)
        })
      })
    })
  }

  const stopRealtime = () => {
    if (unsubRoomRef.current) unsubRoomRef.current()
    if (unsubPartsRef.current) unsubPartsRef.current()
  }


  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const startGame = () => {
    setCountdown(5)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer)
          // Update room status and navigate
          fetch('/api/room/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
            .finally(() => {
              // Redirect admin to spectate page, others to game page
              if (isHost) {
                router.push(`/spectate/${code}`)
              } else {
                router.push(`/game/${code}`)
              }
            })
          
          return null
        }
        return prev! - 1
      })
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Terminal className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p>Loading room...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Terminal className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "The room you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/")} className="w-full sm:w-auto">Go Home</Button>
        </div>
      </div>
    )
  }

  // Check if current user is already in the room
  const isUserInRoom = players.some(player => player.id === (currentUser?.id || currentUser?.uid))

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-primary neon-glow flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold font-mono truncate">{room.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {room.status === 'waiting' ? 'Waiting for players to join...' : 'Game in progress...'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={copyRoomCode}
              className="border-primary text-primary hover:bg-primary hover:text-white-foreground bg-transparent text-xs sm:text-sm"
              size="sm"
            >
              {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />}
              <span className="truncate">{code}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Players List */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="border-primary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-primary text-lg sm:text-xl">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Players ({players.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="border-2 border-primary w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground font-mono text-xs sm:text-sm">
                            {player.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-semibold text-sm sm:text-base truncate">{player.name}</span>
                            {player.is_host && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                <Crown className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                HOST
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {player.college || " "}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-primary text-primary-foreground text-xs flex-shrink-0 ml-2">
                        JOINED
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Controls Sidebar */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Room Info */}
            <Card className="border-primary bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-primary text-lg">Room Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status:</span>
                  <Badge variant={room.status === 'waiting' ? 'default' : 'secondary'} className="text-xs">
                    {room.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Visibility:</span>
                  <span className="text-sm font-mono">{room.is_public ? "Public" : "Private"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm font-mono">
                    {new Date(room.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Players:</span>
                  <span className="text-sm font-mono">{players.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Start Game Button - More Visible */}
            {room.status === 'waiting' && (
              <Card className="border-green-500/50 bg-green-500/5 backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6">
                  {isHost && isUserInRoom ? (
                    countdown ? (
                      <div className="text-center">
                        <div className="text-4xl sm:text-6xl font-bold text-green-500 mb-2 neon-glow animate-pulse">
                          {countdown}
                        </div>
                        <p className="text-sm text-muted-foreground">Starting game...</p>
                      </div>
                    ) : (
                      <Button
                        onClick={startGame}
                        className="w-full bg-green-600 hover:bg-green-700 text-white border-green-500 neon-glow shadow-lg"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Challenge
                      </Button>
                    )
                  ) : !isHost ? (
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Waiting for the host to start the game...
                      </p>
                    </div>
                  ) : !isUserInRoom ? (
                    <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-sm text-yellow-600">
                        You need to join the room first
                      </p>
                    </div>
                  ) : null}
              </CardContent>
              </Card>
            )}

            {room.status !== 'waiting' && (
              <Card className="border-blue-500/50 bg-blue-500/5 backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6 text-center">
                  <p className="text-sm text-blue-400 mb-4">Game is in progress</p>
                  <Button
                    onClick={() => {
                      // Redirect admin to spectate page, others to game page
                      if (isHost) {
                        router.push(`/spectate/${code}`)
                      } else {
                        router.push(`/game/${code}`)
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isHost ? "Spectate Game" : "Join Game"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}