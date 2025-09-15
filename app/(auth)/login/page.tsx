"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [college, setCollege] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isAdmin = email.toLowerCase().includes("admin")
    router.push(isAdmin ? "/admin" : "/dashboard")
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" value={college} onChange={(e) => setCollege(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full neon-glow" size="lg">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


