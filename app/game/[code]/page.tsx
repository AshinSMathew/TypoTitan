"use client"
import type React from "react"
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Terminal, Users, Eye, Share2 } from "lucide-react"

interface Player {
  id: string
  name: string
  wpm: number
  accuracy: number
  progress: number
  isFinished: boolean
}

interface Command {
  id: string
  text: string
  difficulty: "easy" | "medium" | "hard"
  category: string
}

const COMMANDS: Command[] = [
  { id: "1", text: "ls -la", difficulty: "easy", category: "File Operations" },
  { id: "2", text: "pwd", difficulty: "easy", category: "Navigation" },
  { id: "3", text: "whoami", difficulty: "easy", category: "System Info" },
  { id: "4", text: "ps aux", difficulty: "easy", category: "Process Management" },
  { id: "5", text: "cat /etc/passwd", difficulty: "easy", category: "File Operations" },
  { id: "6", text: "netstat -tulpn", difficulty: "medium", category: "Network Analysis" },
  { id: "7", text: "nmap -sS 192.168.1.1", difficulty: "medium", category: "Network Scanning" },
  { id: "8", text: 'grep -r "password" /var/log/', difficulty: "medium", category: "Log Analysis" },
  { id: "9", text: "tcpdump -i eth0 port 80", difficulty: "medium", category: "Network Monitoring" },
  { id: "10", text: 'find / -name "*.conf" 2>/dev/null', difficulty: "medium", category: "File Search" },
  {
    id: "11",
    text: "openssl enc -aes-256-cbc -salt -in file.txt -out file.enc",
    difficulty: "hard",
    category: "Encryption",
  },
  { id: "12", text: "iptables -A INPUT -p tcp --dport 22 -j DROP", difficulty: "hard", category: "Firewall" },
  {
    id: "13",
    text: "john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt",
    difficulty: "hard",
    category: "Password Cracking",
  },
  {
    id: "14",
    text: 'sqlmap -u "http://target.com/page.php?id=1" --dbs',
    difficulty: "hard",
    category: "SQL Injection",
  },
  {
    id: "15",
    text: "hydra -l admin -P passwords.txt ssh://192.168.1.100",
    difficulty: "hard",
    category: "Brute Force",
  },
]

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string
  const inputRef = useRef<HTMLInputElement>(null)
  const [playerName, setPlayerName] = useState("")
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<"easy" | "medium" | "hard">("easy")
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [errors, setErrors] = useState<number[]>([])
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [levelProgress, setLevelProgress] = useState(0)

  const selfIdRef = useRef<string>(Math.random().toString(36).slice(2))
  const selfId = selfIdRef.current

  const [players, setPlayers] = useState<Player[]>([
    { id: "bot1", name: "CyberHacker", wpm: 45, accuracy: 92, progress: 60, isFinished: false },
    { id: "bot2", name: "TerminalMaster", wpm: 38, accuracy: 88, progress: 45, isFinished: false },
    { id: "bot3", name: "CodeNinja", wpm: 52, accuracy: 95, progress: 75, isFinished: false },
  ])

  useEffect(() => {
    if (nameSubmitted) {
      setPlayers((prev) => {
        const exists = prev.some((p) => p.id === selfId)
        if (exists) return prev
        const me: Player = {
          id: selfId,
          name: playerName || "Player",
          wpm: 0,
          accuracy: 100,
          progress: 0,
          isFinished: false,
        }
        return [...prev, me]
      })
    }
  }, [nameSubmitted, playerName, selfId]) 

  useEffect(() => {
    if (!nameSubmitted) return
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === selfId
          ? {
              ...p,
              name: playerName || p.name,
              wpm,
              accuracy,
              progress: Math.max(p.progress, Math.round(levelProgress)),
              isFinished: gameFinished || p.isFinished,
            }
          : p,
      ),
    )
  }, [wpm, accuracy, levelProgress, gameFinished, nameSubmitted, playerName, selfId]) // [8]

  const currentCommands = useMemo(
    () => COMMANDS.filter((cmd) => cmd.difficulty === currentLevel),
    [currentLevel],
  )
  const currentCommand = currentCommands[currentCommandIndex]

  useEffect(() => {
    const disabledCtrlShift = new Set(["I", "J", "C"])
    const sysCombos = new Set(["U", "S", "P"]) // view-source, save, print

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false
      const tag = el.tagName
      return el.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || (tag === "DIV" && el.getAttribute("role") === "textbox")
    }

    const isPrintableKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false
      return e.key.length === 1 || e.key === " "
    }

    let composing = false
    const handleCompositionStart = () => { composing = true }
    const handleCompositionEnd = () => { composing = false }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toUpperCase()
      const targetIsEditable = isEditable(e.target)

      if (targetIsEditable && (isPrintableKey(e) || composing)) return

      if (e.key === "F12") { e.preventDefault(); e.stopPropagation(); return }
      if (e.ctrlKey && e.shiftKey && key && disabledCtrlShift.has(key)) { e.preventDefault(); e.stopPropagation(); return }
      if ((e.ctrlKey || e.metaKey) && key && sysCombos.has(key)) { e.preventDefault(); e.stopPropagation(); return }

      const t = e.target as HTMLElement | null
      const onlyGameInput = t && t instanceof HTMLInputElement && t === inputRef.current
      if (onlyGameInput && (e.ctrlKey || e.metaKey) && key && ["C","V","X"].includes(key)) {
        e.preventDefault(); e.stopPropagation(); return
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("compositionstart", handleCompositionStart)
    document.addEventListener("compositionend", handleCompositionEnd)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("compositionstart", handleCompositionStart)
      document.removeEventListener("compositionend", handleCompositionEnd)
    }
  }, []) 
  const INITIAL_TIME = 5 * 60
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)
  const [timerRunning, setTimerRunning] = useState(false)
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  useEffect(() => {
    if (!gameStarted) return
    setTimerRunning(true)
  }, [gameStarted]) 

  useEffect(() => {
    if (!timerRunning || gameFinished) return
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setTimerRunning(false)
          setGameFinished(true)
          setLevelProgress(100)
          setPlayers((prevPlayers) =>
            prevPlayers.map((p) =>
              p.id === selfId ? { ...p, isFinished: true, progress: 100 } : p,
            ),
          )
          router.push(`/results/${roomCode}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [timerRunning, gameFinished, router, roomCode, selfId, setPlayers]) 

  useLayoutEffect(() => {
    if (gameStarted) inputRef.current?.focus()
  }, [gameStarted]) 

  useLayoutEffect(() => {
    if (gameStarted) inputRef.current?.focus()
  }, [currentCommandIndex, gameStarted]) 

  const startGame = () => {
    setGameStarted(true)
    setGameFinished(false)
    setTimeLeft(INITIAL_TIME)
    setTimerRunning(true)
    setStartTime(Date.now())
  } 

  const calculateWPM = () => {
    if (!startTime) return 0
    const timeElapsed = (Date.now() - startTime) / 1000 / 60
    const wordsTyped = userInput.trim().split(" ").filter(Boolean).length
    return Math.max(0, Math.round(wordsTyped / Math.max(timeElapsed, 1e-6)))
  }

  const calculateAccuracy = () => {
    if (!currentCommand || userInput.length === 0) return 100
    let correct = 0
    const minLength = Math.min(userInput.length, currentCommand.text.length)
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] === currentCommand.text[i]) correct++
    }
    return Math.round((correct / currentCommand.text.length) * 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserInput(value)
    setWpm(calculateWPM())
    setAccuracy(calculateAccuracy())

    const newErrors: number[] = []
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentCommand.text[i]) newErrors.push(i)
    }
    setErrors(newErrors)

    if (value === currentCommand.text) {
      setTimeout(() => {
        if (currentCommandIndex < currentCommands.length - 1) {
          const nextIndex = currentCommandIndex + 1
          setCurrentCommandIndex(nextIndex)
          setUserInput("")
          setErrors([])
          setLevelProgress((nextIndex / currentCommands.length) * 100)
        } else {
          if (currentLevel === "easy") {
            setCurrentLevel("medium")
            setCurrentCommandIndex(0)
            setUserInput("")
            setErrors([])
            setLevelProgress(0)
          } else if (currentLevel === "medium") {
            setCurrentLevel("hard")
            setCurrentCommandIndex(0)
            setUserInput("")
            setErrors([])
            setLevelProgress(0)
          } else {
            setGameFinished(true)
            setLevelProgress(100)
            setPlayers((prev) =>
              prev.map((p) => (p.id === selfId ? { ...p, isFinished: true, progress: 100 } : p)),
            )
            router.push(`/results/${roomCode}`)
          }
        }
      }, 500)
    }
  }

  const blockClipboardEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const blockSelectDragDrop = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const renderCommand = () => {
    if (!currentCommand) return null
    return (
      <div className="font-mono text-lg">
        {currentCommand.text.split("").map((char, index) => {
          let className = "transition-colors duration-150"
          if (index < userInput.length) {
            if (userInput[index] === char) className += " text-primary bg-primary/20"
            else className += " text-destructive bg-destructive/20"
          } else if (index === userInput.length) {
            className += " bg-accent/50 animate-pulse"
          } else {
            className += " text-muted-foreground"
          }
          return (
            <span key={index} className={className}>
              {char}
            </span>
          )
        })}
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-primary"
      case "medium":
        return "text-secondary"
      case "hard":
        return "text-accent"
      default:
        return "text-foreground"
    }
  }
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress
      if (b.wpm !== a.wpm) return b.wpm - a.wpm
      return b.accuracy - a.accuracy
    })
  }, [players])

  const shareSpectatorLink = async () => {
    const spectatorUrl = `${window.location.origin}/spectate/${roomCode}`
    try {
      await navigator.clipboard.writeText(spectatorUrl)
      console.log("Spectator link copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy spectator link:", err)
    }
  }
  if (!nameSubmitted) {
    return (
      <div className="min-h-screen bg-background terminal-grid flex items-center justify-center">
        <Card className="border-primary/50 bg-card/50 backdrop-blur-sm max-w-md w-full">
          <CardHeader className="text-center">
            <Terminal className="w-16 h-16 text-primary neon-glow mx-auto mb-4" />
            <CardTitle className="text-2xl font-mono">Enter Player Name</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
              placeholder="Your name"
              className="w-full bg-transparent border rounded px-3 py-2 outline-none text-foreground placeholder-muted-foreground"
              onCopy={(e) => { e.preventDefault(); e.stopPropagation() }}
              onPaste={(e) => { e.preventDefault(); e.stopPropagation() }}
              onCut={(e) => { e.preventDefault(); e.stopPropagation() }}
              onDrop={blockSelectDragDrop}
              onDragStart={blockSelectDragDrop}
              onSelect={blockSelectDragDrop}
            />
            <Button
              onClick={() => setNameSubmitted(true)}
              className="w-full neon-glow"
              size="lg"
              disabled={!playerName.trim()}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background terminal-grid flex items-center justify-center">
        <Card className="border-primary/50 bg-card/50 backdrop-blur-sm max-w-md w/full">
          <CardHeader className="text-center">
            <Terminal className="w-16 h-16 text-primary neon-glow mx-auto mb-4" />
            <CardTitle className="text-2xl font-mono">Ready to Hack, {playerName}?</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {"You'll face 15 cybersecurity commands across 3 difficulty levels. Type as fast and accurately as possible!"}
            </p>
            <Button onClick={startGame} className="w-full neon-glow" size="lg">
              Start Challenge
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Terminal className="w-8 h-8 text-primary neon-glow" />
            <div>
              <h1 className="text-2xl font-bold font-mono">Cyber Arena</h1>
              <p className="text-sm text-muted-foreground">Room: {roomCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={`border-current ${getDifficultyColor(currentLevel)}`}>
              {currentLevel.toUpperCase()} LEVEL
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground">
              Time left: <span className="font-mono text-primary">{formatTime(timeLeft)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={shareSpectatorLink}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Spectator Link
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Typing Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Command Display */}
            <Card className="border-primary/50 bg-black/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-mono text-sm">
                    root@cybertype:~$ {currentCommand?.category}
                  </CardTitle>
                  <Badge variant="secondary">
                    {currentCommandIndex + 1} / {currentCommands.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">{renderCommand()}</div>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none text-lg font-mono text-foreground placeholder-muted-foreground"
                  placeholder="Type the command here..."
                  disabled={gameFinished}
                  autoFocus
                  onCopy={blockClipboardEvent}
                  onPaste={blockClipboardEvent}
                  onCut={blockClipboardEvent}
                  onDrop={blockSelectDragDrop}
                  onDragStart={blockSelectDragDrop}
                />
              </CardContent>
            </Card>

            {/* Progress */}
            <Card className="border-accent/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Level Progress</span>
                    <span>{Math.round(levelProgress)}%</span>
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{wpm}</div>
                      <div className="text-xs text-muted-foreground">WPM</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">{accuracy}%</div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">{errors.length}</div>
                      <div className="text-xs text-muted-foreground">Errors</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Players Sidebar */}
          <div className="space-y-4">
            <Card className="border-secondary/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary text-sm">
                  <Users className="w-4 h-4" />
                  Live Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-3 p-2 rounded border border-border">
                    <div className="text-sm font-bold text-primary">#{index + 1}</div>
                    <Avatar className="w-8 h-8 border border-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {player.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {player.name}
                        {player.id === selfId ? " (You)" : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.wpm} WPM • {player.accuracy}%
                      </div>
                      <Progress value={player.progress} className="h-1 mt-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-primary text-sm">Challenge Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-primary">Easy (5 commands)</span>
                  <span>
                    {currentLevel === "easy"
                      ? "🔄"
                      : currentLevel === "medium" || currentLevel === "hard"
                        ? "✅"
                        : "⏳"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Medium (5 commands)</span>
                  <span>{currentLevel === "medium" ? "🔄" : currentLevel === "hard" ? "✅" : "⏳"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent">Hard (5 commands)</span>
                  <span>{currentLevel === "hard" ? "🔄" : "⏳"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent text-sm">
                  <Eye className="w-4 h-4" />
                  Spectators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">3</div>
                  <div className="text-xs text-muted-foreground">Watching</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Chat removed */}
    </div>
  )
}
