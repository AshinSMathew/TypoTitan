import { Terminal } from "lucide-react";
export const GameHeader = ({ code, timeLeft }: { code: string, timeLeft: number }) => {
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Terminal className="w-8 h-8 text-primary neon-glow" />
        <div>
          <h1 className="text-2xl font-bold font-mono">Cyber Arena</h1>
          <p className="text-sm text-muted-foreground">Room: {code}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          Time: <span className="font-mono text-primary">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </div>
  );
};