import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal } from "lucide-react";

import type { User } from "@/lib/types"

export const StartScreen = ({ currentUser, startGame }: { currentUser: User, startGame: () => void }) => (
  <div className="min-h-screen bg-background terminal-grid flex items-center justify-center p-4">
    <Card className="border-primary/50 bg-card/50 backdrop-blur-sm max-w-md w-full">
      <CardHeader className="text-center">
        <Terminal className="w-16 h-16 text-primary neon-glow mx-auto mb-4" />
        <CardTitle className="text-2xl font-mono">Ready to Hack, {currentUser.name}?</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {"You'll face cybersecurity commands. Type as fast and accurately as possible!"}
        </p>
        <Button onClick={startGame} className="w-full neon-glow" size="lg">
          Start Challenge
        </Button>
      </CardContent>
    </Card>
  </div>
);