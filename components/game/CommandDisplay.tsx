export const CommandDisplay = ({ 
  typedHistory, 
  currentCommand, 
  userInput, 
  currentCommandIndex, 
  words,
  errorIndices
}: { 
  typedHistory: string[], 
  currentCommand: string, 
  userInput: string, 
  currentCommandIndex: number, 
  words: string[],
  errorIndices: number[]
}) => {
  return (
    <div className="font-mono text-lg md:text-xl leading-loose break-all bg-black/80 p-6 rounded-lg">
      {/* Previously typed commands */}
      <div className="text-muted-foreground opacity-60 mb-4">
        {typedHistory.join(' ')}
      </div>
      
      {/* Current command being typed */}
      <div className="mb-4">
        {currentCommand?.split("").map((char, index) => {
          let className = "transition-colors duration-150"
          if (index < userInput.length) {
            if (userInput[index] === char) className += " text-primary"
            else className += " text-destructive bg-destructive/20"
          } else if (index === userInput.length) {
            className += " bg-accent/50 animate-pulse"
          } else {
            className += " text-muted-foreground"
          }
          
          // Highlight persistent errors
          if (errorIndices.includes(index)) {
            className += " text-destructive bg-destructive/20"
          }
          
          return (
            <span key={index} className={className}>
              {char}
            </span>
          )
        })}
      </div>
      
      {/* Upcoming commands */}
      <div className="text-muted-foreground opacity-60">
        {words.slice(currentCommandIndex + 1, currentCommandIndex + 3).join(' ')}
      </div>
    </div>
  );
};