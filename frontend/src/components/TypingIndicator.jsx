export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2 animate-fade-in">
      <span className="w-2 h-2 bg-text-muted rounded-full typing-dot" />
      <span className="w-2 h-2 bg-text-muted rounded-full typing-dot" />
      <span className="w-2 h-2 bg-text-muted rounded-full typing-dot" />
    </div>
  )
}
