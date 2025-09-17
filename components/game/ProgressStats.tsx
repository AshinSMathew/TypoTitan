import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export const ProgressStats = ({ progress, wpm, errors }: { 
  progress: number, 
  wpm: number, 
  errors: number 
}) => {
  return (
    <Card className="border-accent/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{wpm}</div>
              <div className="text-xs text-muted-foreground">WPM</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{errors}</div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};