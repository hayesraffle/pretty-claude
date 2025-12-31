import { Loader2, CheckCircle2, Circle } from 'lucide-react'

export default function TaskProgress({ todos, isBlocked }) {
  if (!todos || todos.length === 0) return null

  const completedCount = todos.filter((t) => t.status === 'completed').length
  const inProgressTask = todos.find((t) => t.status === 'in_progress')
  const progress = Math.round((completedCount / todos.length) * 100)

  // Don't show if all tasks are completed
  if (completedCount === todos.length) return null

  return (
    <div className="flex items-center gap-3 text-xs text-text-muted">
      {/* Progress indicator */}
      <div className="flex items-center gap-1.5">
        {isBlocked ? (
          <Circle size={12} className="text-warning" />
        ) : inProgressTask ? (
          <Loader2 size={12} className="text-accent animate-spin" />
        ) : (
          <Circle size={12} />
        )}
        <span className="tabular-nums">{completedCount}/{todos.length}</span>
      </div>

      {/* Current task */}
      {inProgressTask && (
        <>
          <span className="text-border">·</span>
          <span className={`truncate max-w-[300px] ${isBlocked ? 'text-warning' : ''}`}>
            {isBlocked ? 'Waiting for approval' : inProgressTask.activeForm || inProgressTask.content}
          </span>
        </>
      )}

      {/* Progress bar */}
      <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden min-w-[40px] max-w-[80px]">
        <div
          className="h-full bg-success rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
