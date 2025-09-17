import { Terminal } from "lucide-react";

export const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="text-center">
      <Terminal className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
      <p>Loading game...</p>
    </div>
  </div>
);