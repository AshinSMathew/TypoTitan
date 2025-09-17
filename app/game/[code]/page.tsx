"use client"
import type React from "react"
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


import { LoadingScreen } from "@/components/game/LoadingScreen"
import { StartScreen } from "@/components/game/StartScreen"
import { ResultsScreen } from "@/components/game/ResultScreen"
import { CommandDisplay } from "@/components/game/CommandDisplay"
import { GameHeader } from "@/components/game/GameHeader"
import { ProgressStats } from "@/components/game/ProgressStats"
import { PlayerStats } from "@/components/game/PlayerStats"


import type { User, Player, Command } from "@/lib/types"

const COMMANDS: Command[] = [
  // --- EASY (8) ---
  { id: "1",  text: "ls -la", difficulty: "easy", category: "File Operations" },
  { id: "2",  text: "pwd", difficulty: "easy", category: "Navigation" },
  { id: "3",  text: "whoami", difficulty: "easy", category: "System Info" },
  { id: "4",  text: "cat /etc/passwd", difficulty: "easy", category: "File Operations" },
  { id: "5",  text: "ps aux", difficulty: "easy", category: "Process Management" },
  { id: "6",  text: "echo $HOME", difficulty: "easy", category: "Environment" },
  { id: "7",  text: "date '+%Y-%m-%d %H:%M:%S'", difficulty: "easy", category: "Time/Date" },
  { id: "8",  text: "uptime", difficulty: "easy", category: "System Info" },

  // --- MEDIUM (9) ---
  { id: "9",  text: "grep -r 'error' /var/log/", difficulty: "medium", category: "Log Analysis" },
  { id: "10", text: "find / -name '*.conf' 2>/dev/null", difficulty: "medium", category: "File Search" },
  { id: "11", text: "netstat -tulpn", difficulty: "medium", category: "Network Analysis" },
  { id: "12", text: "df -h", difficulty: "medium", category: "Disk Usage" },
  { id: "13", text: "du -sh * | sort -h", difficulty: "medium", category: "Disk Usage" },
  { id: "14", text: "history | tail -n 20", difficulty: "medium", category: "History" },
  { id: "15", text: "wc -l /var/log/syslog", difficulty: "medium", category: "File Operations" },
  { id: "16", text: "awk '{print $1,$2}' /etc/passwd | head", difficulty: "medium", category: "Text Processing" },
  { id: "17", text: "chmod -R 755 ~/projects/", difficulty: "medium", category: "Permissions" },

  // --- HARD (8) ---
  { id: "18", text: "openssl enc -aes-256-cbc -salt -in file.txt -out file.enc", difficulty: "hard", category: "Encryption" },
  { id: "19", text: "iptables -A INPUT -p tcp --dport 22 -j DROP", difficulty: "hard", category: "Firewall" },
  { id: "20", text: "ssh -p 2222 user@192.168.1.50", difficulty: "hard", category: "SSH/Remote" },
  { id: "21", text: "tar -czvf backup.tar.gz /var/www/html/", difficulty: "hard", category: "Archiving" },
  { id: "22", text: "rsync -avz /home/user/ backup@192.168.1.100:/backups/", difficulty: "hard", category: "Backup" },
  { id: "23", text: "curl -I https://example.com", difficulty: "hard", category: "Networking" },
  { id: "24", text: "systemctl status apache2 --no-pager", difficulty: "hard", category: "Services" },
  { id: "25", text: "journalctl -u ssh --since '1 hour ago'", difficulty: "hard", category: "Log Analysis" }
];

export default function GamePage() {
  const params = useParams()
  const code = params.code as string
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [errors, setErrors] = useState<number[]>([])
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [totalErrors, setTotalErrors] = useState(0)
  const [typedHistory, setTypedHistory] = useState<string[]>([])
  const [words, setWords] = useState<string[]>([])
  const [persistentErrorIndices, setPersistentErrorIndices] = useState<number[]>([])

  const selfIdRef = useRef<string>("")
  const selfId = selfIdRef.current

  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    // Get current user from API
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me')
        const data = await response.json()
        if (data.success) {
          setCurrentUser(data.user)
          selfIdRef.current = data.user.uid || data.user.id
          
          // Add current user to players list
          setPlayers(prev => {
            const exists = prev.some(p => p.id === selfIdRef.current)
            if (exists) return prev
            return [...prev, {
              id: selfIdRef.current,
              name: data.user.name || "Player",
              wpm: 0,
              accuracy: 100,
              progress: 0,
              isFinished: false,
              errors: 0
            }]
          })
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (!gameStarted) return
    
    // Update player stats in the database periodically
    const updateStats = async () => {
      try {
        await fetch(`/api/game/${code}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playerId: selfId,
            wpm,
            accuracy,
            errors: totalErrors,
            isFinished: gameFinished
          })
        })
      } catch (error) {
        console.error("Failed to update stats:", error)
      }
    }

    const interval = setInterval(updateStats, 3000)
    return () => clearInterval(interval)
  }, [gameStarted, wpm, accuracy, totalErrors, gameFinished, code, selfId])

  // Prepare all commands as a single paragraph
  useEffect(() => {
    const allCommands = COMMANDS.map(cmd => cmd.text)
    setWords(allCommands)
  }, [])

  const currentCommand = useMemo(() => words[currentCommandIndex], [words, currentCommandIndex])

  useEffect(() => {
    const disabledCtrlShift = new Set(["I", "J", "C"])
    const sysCombos = new Set(["U", "S", "P"])

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

  const INITIAL_TIME = 15 * 60 // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME)
  const [timerRunning, setTimerRunning] = useState(false)

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
          setProgress(100)
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [timerRunning, gameFinished])

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
    setTotalErrors(0)
    setCurrentCommandIndex(0)
    setUserInput("")
    setTypedHistory([])
    setProgress(0)
    setPersistentErrorIndices([])
  }

  const calculateWPM = () => {
    if (!startTime) return 0
    const timeElapsed = (Date.now() - startTime) / 1000 / 60
    const charactersTyped = typedHistory.join(' ').length + userInput.length
    // Assuming average word length is 5 characters
    const wordsTyped = charactersTyped / 5
    return Math.max(0, Math.round(wordsTyped / Math.max(timeElapsed, 0.0167))) // Minimum 1 second
  }

  const calculateAccuracy = () => {
    if (!currentCommand || userInput.length === 0) return 100
    
    let correctChars = 0
    const minLength = Math.min(userInput.length, currentCommand.length)
    
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] === currentCommand[i]) correctChars++
    }
    
    return Math.round((correctChars / currentCommand.length) * 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserInput(value)
    
    const newWpm = calculateWPM()
    const newAccuracy = calculateAccuracy()
    
    setWpm(newWpm)
    setAccuracy(newAccuracy)

    // Track current errors
    const newErrors: number[] = []
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentCommand[i]) {
        newErrors.push(i)
        
        // Add to persistent errors if not already there
        if (!persistentErrorIndices.includes(i)) {
          setPersistentErrorIndices(prev => [...prev, i])
          setTotalErrors(prev => prev + 1)
        }
      }
    }
    setErrors(newErrors)

    // Automatically move to next command when current command is completed
    if (value === currentCommand) {
      setTimeout(() => {
        setTypedHistory([...typedHistory, value])
        setUserInput("")
        setErrors([])
        setPersistentErrorIndices([])
        
        if (currentCommandIndex < words.length - 1) {
          const nextIndex = currentCommandIndex + 1
          setCurrentCommandIndex(nextIndex)
          setProgress((nextIndex / words.length) * 100)
        } else {
          setGameFinished(true)
          setProgress(100)
          setShowResults(true)
        }
      }, 0)
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

  if (!currentUser) {
    return <LoadingScreen />
  }

  if (!gameStarted) {
    return <StartScreen currentUser={currentUser} startGame={startGame} />
  }

  if (showResults) {
    return <ResultsScreen wpm={wpm} accuracy={accuracy} totalErrors={totalErrors} progress={progress} code={code} />
  }

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="container mx-auto px-4 py-6">
        <GameHeader code={code} timeLeft={timeLeft} />

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Typing Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Command Display */}
            <Card className="border-primary/50 bg-black/80">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-primary font-mono text-sm">
                    root@cybertype:~$
                  </CardTitle>
                  <Badge variant="secondary" className="self-start sm:self-auto">
                    {currentCommandIndex + 1} / {words.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CommandDisplay 
                  typedHistory={typedHistory}
                  currentCommand={currentCommand}
                  userInput={userInput}
                  currentCommandIndex={currentCommandIndex}
                  words={words}
                  errorIndices={persistentErrorIndices}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full mt-4 bg-transparent border-none outline-none text-lg font-mono text-foreground placeholder-muted-foreground"
                  placeholder="Type the commands here..."
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

            <ProgressStats progress={progress} wpm={wpm} accuracy={accuracy} errors={totalErrors} />
          </div>

          {/* Player Stats Sidebar */}
          <div className="space-y-4">
            <PlayerStats currentCommandIndex={currentCommandIndex} words={words} timeLeft={timeLeft} />
          </div>
        </div>
      </div>
    </div>
  )
}