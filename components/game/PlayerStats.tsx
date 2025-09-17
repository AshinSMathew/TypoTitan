import { Card, CardHeader,CardTitle, CardContent } from "../ui/card";
export const PlayerStats = ({ currentCommandIndex, words, timeLeft }: { 
  currentCommandIndex: number, 
  words: string[], 
  timeLeft: number 
}) => {
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  return (
    <Card className="border-primary/30 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-primary text-sm">Your Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Commands Completed</span>
          <span className="font-mono">{currentCommandIndex}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Commands</span>
          <span className="font-mono">{words.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time Remaining</span>
          <span className="font-mono">{formatTime(timeLeft)}</span>
        </div>
      </CardContent>
    </Card>
  );
};