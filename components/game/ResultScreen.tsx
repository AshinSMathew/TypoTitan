import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "../ui/button";
import { Terminal, Trophy } from "lucide-react"

export const ResultsScreen = ({ wpm, accuracy, totalErrors, progress, code }: { 
  wpm: number, 
  accuracy: number, 
  totalErrors: number, 
  progress: number, 
  code: string 
}) => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="border-primary/50 bg-card/50 backdrop-blur-sm max-w-md w-full">
        <CardHeader className="text-center">
          <Terminal className="w-16 h-16 text-primary neon-glow mx-auto mb-4" />
          <CardTitle className="text-2xl font-mono">Challenge Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary">{wpm}</div>
              <div className="text-sm text-muted-foreground">WPM</div>
            </div>
            <div className="bg-secondary/10 p-4 rounded-lg">
              <div className="text-3xl font-bold text-secondary">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="text-3xl font-bold text-accent">{totalErrors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="bg-green-500/10 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-500">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push(`/results/${code}`)}
            className="w-full neon-glow"
            size="lg"
          >
            <Trophy className="w-5 h-5 mr-2" />
            View Leaderboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};