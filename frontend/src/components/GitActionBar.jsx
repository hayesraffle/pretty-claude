import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

export default function GitActionBar({ onCommit, onPush, onDismiss, onCelebrate }) {
  const [status, setStatus] = useState('ready') // ready, committing, committed, pushing, pushed, error
  const [error, setError] = useState(null)

  const handleCommit = async () => {
    setStatus('committing')
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Commit failed')
      }

      if (data.success) {
        setStatus('committed')
        onCelebrate?.()
        onCommit?.(data)
      } else {
        setError(data.message || 'Nothing to commit')
        setStatus('ready')
      }
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const handlePush = async () => {
    setStatus('pushing')
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Push failed')
      }

      if (data.success) {
        setStatus('pushed')
        onPush?.(data)
        // Auto-dismiss after successful push
        setTimeout(() => onDismiss?.(), 2000)
      }
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  // Already pushed - show success and fade out
  if (status === 'pushed') {
    return (
      <div className="flex justify-center py-3 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
          <Check size={16} />
          Pushed
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-3 animate-fade-in">
      <div className="inline-flex items-center gap-3">
        {status === 'committed' && (
          <Check size={16} className="text-success flex-shrink-0" />
        )}
        {status !== 'ready' && (
          <span className="text-sm text-text whitespace-nowrap">
            {status === 'committing' && 'Committing...'}
            {status === 'committed' && 'Committed'}
            {status === 'pushing' && 'Pushing...'}
            {status === 'error' && (error || 'Error')}
          </span>
        )}
        {status === 'ready' && (
          <button onClick={handleCommit} className="btn-cta text-sm py-1.5 px-4">
            Commit
          </button>
        )}
        {status === 'committing' && (
          <button disabled className="btn-cta text-sm py-1.5 px-4 opacity-50 cursor-not-allowed">
            <Loader2 size={14} className="animate-spin" />
          </button>
        )}
        {status === 'committed' && (
          <button onClick={handlePush} className="btn-cta text-sm py-1.5 px-4">
            Push
          </button>
        )}
        {status === 'pushing' && (
          <button disabled className="btn-cta text-sm py-1.5 px-4 opacity-50 cursor-not-allowed">
            <Loader2 size={14} className="animate-spin" />
          </button>
        )}
        {status === 'error' && (
          <button onClick={handleCommit} className="btn-cta text-sm py-1.5 px-4">
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
