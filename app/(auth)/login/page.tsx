"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { clientAuth } from "@/lib/firebaseClient"
import { signInWithEmailAndPassword, getIdToken } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const cred = await signInWithEmailAndPassword(clientAuth, email, password)
      const token = await getIdToken(cred.user, true)

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token, name: cred.user.displayName, email: cred.user.email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        router.push(data.user.isAdmin ? "/admin" : "/dashboard")
      } else {
        alert(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background terminal-grid flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-primary/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <Terminal className="w-10 h-10 text-primary neon-glow mx-auto mb-2" />
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full neon-glow" size="lg" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}