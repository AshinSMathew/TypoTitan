"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, Eye, Crown } from "lucide-react"

interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: Date
  type: "message" | "system" | "achievement"
  isSpectator?: boolean
}

interface ChatPanelProps {
  roomCode: string
  currentUser: string
  isSpectator?: boolean
}

export function ChatPanel({ currentUser, isSpectator = false }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "system",
      username: "System",
      message: "Welcome to the CyberType arena! Good luck hackers!",
      timestamp: new Date(Date.now() - 300000),
      type: "system",
    },
    {
      id: "2",
      userId: "2",
      username: "TerminalMaster",
      message: "Ready to get pwned? 😎",
      timestamp: new Date(Date.now() - 240000),
      type: "message",
    },
    {
      id: "3",
      userId: "3",
      username: "CodeNinja",
      message: "Let's see who's the fastest fingers in the cyber world!",
      timestamp: new Date(Date.now() - 180000),
      type: "message",
    },
    {
      id: "4",
      userId: "system",
      username: "System",
      message: "CyberHacker completed Easy level with 95% accuracy!",
      timestamp: new Date(Date.now() - 120000),
      type: "achievement",
    },
    {
      id: "5",
      userId: "spectator1",
      username: "WatcherBot",
      message: "Amazing speed on that nmap command!",
      timestamp: new Date(Date.now() - 60000),
      type: "message",
      isSpectator: true,
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: "1",
      username: currentUser,
      message: newMessage,
      timestamp: new Date(),
      type: "message",
      isSpectator,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.type) {
      case "system":
        return "text-accent bg-accent/10 border-accent/20"
      case "achievement":
        return "text-primary bg-primary/10 border-primary/20"
      default:
        return message.isSpectator
          ? "text-secondary bg-secondary/10 border-secondary/20"
          : "text-foreground bg-muted/20 border-border"
    }
  }

  const getUserIcon = (message: ChatMessage) => {
    if (message.type === "system") return "SYS"
    if (message.type === "achievement") return "🏆"
    return message.username.slice(0, 2).toUpperCase()
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-12 h-12 border-primary/50 bg-card/90 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform">
        <CardContent className="p-0 flex items-center justify-center h-full" onClick={() => setIsMinimized(false)}>
          <MessageCircle className="w-6 h-6 text-primary neon-glow" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 border-primary/50 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary text-sm">
            <MessageCircle className="w-4 h-4" />
            Arena Chat
            {isSpectator && (
              <Badge variant="outline" className="text-xs border-secondary text-secondary">
                <Eye className="w-3 h-3 mr-1" />
                Spectator
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 flex flex-col h-80">
        <ScrollArea className="flex-1 pr-2" ref={scrollAreaRef}>
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className={`p-2 rounded border ${getMessageStyle(message)}`}>
                <div className="flex items-start gap-2">
                  <Avatar className="w-6 h-6 border border-current">
                    <AvatarFallback className="text-xs bg-transparent">{getUserIcon(message)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium truncate">{message.username}</span>
                      {message.isSpectator && <Eye className="w-3 h-3 text-secondary" />}
                      {message.username === currentUser && <Crown className="w-3 h-3 text-yellow-400" />}
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs break-words">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-2">
          <Input
            placeholder={isSpectator ? "Spectator message..." : "Type a message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-8 text-xs bg-input border-border focus:border-primary"
            maxLength={200}
          />
          <Button onClick={sendMessage} size="sm" className="h-8 w-8 p-0 neon-glow" disabled={!newMessage.trim()}>
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
