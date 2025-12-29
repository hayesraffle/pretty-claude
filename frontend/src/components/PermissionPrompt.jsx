import { useState } from 'react'
import {
  Shield,
  ShieldCheck,
  ShieldX,
  FileText,
  Edit3,
  Terminal,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

// Tool risk levels and icons
const TOOL_INFO = {
  Read: { icon: FileText, risk: 'low', description: 'Read file contents' },
  Edit: { icon: Edit3, risk: 'medium', description: 'Modify file contents' },
  Write: { icon: FileText, risk: 'medium', description: 'Create new file' },
  Bash: { icon: Terminal, risk: 'high', description: 'Execute shell command' },
  Glob: { icon: FileText, risk: 'low', description: 'Search for files' },
  Grep: { icon: FileText, risk: 'low', description: 'Search file contents' },
}

const RISK_COLORS = {
  low: 'text-success bg-success/10 border-success/30',
  medium: 'text-warning bg-warning/10 border-warning/30',
  high: 'text-error bg-error/10 border-error/30',
}

export default function PermissionPrompt({
  toolName,
  toolInput,
  toolUseId,
  onApprove,
  onReject,
  onAlwaysAllow,
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const toolInfo = TOOL_INFO[toolName] || {
    icon: Shield,
    risk: 'medium',
    description: `Use ${toolName} tool`,
  }
  const Icon = toolInfo.icon
  const riskColor = RISK_COLORS[toolInfo.risk]

  const handleApprove = () => {
    setIsProcessing(true)
    onApprove?.(toolUseId)
  }

  const handleReject = () => {
    setIsProcessing(true)
    onReject?.(toolUseId)
  }

  const handleAlwaysAllow = () => {
    setIsProcessing(true)
    onAlwaysAllow?.(toolName)
  }

  // Format tool input for display
  const formatInput = () => {
    if (!toolInput) return null

    switch (toolName) {
      case 'Read':
        return toolInput.file_path
      case 'Edit':
        return `${toolInput.file_path} (${toolInput.old_string?.length || 0} → ${toolInput.new_string?.length || 0} chars)`
      case 'Write':
        return `${toolInput.file_path} (${toolInput.content?.length || 0} chars)`
      case 'Bash':
        return toolInput.command
      case 'Glob':
        return `${toolInput.pattern} in ${toolInput.path || '.'}`
      case 'Grep':
        return `"${toolInput.pattern}" in ${toolInput.path || '.'}`
      default:
        return JSON.stringify(toolInput, null, 2)
    }
  }

  return (
    <div className={`border rounded-xl p-4 ${riskColor} animate-fade-in`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${riskColor}`}>
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{toolInfo.description}</span>
            {toolInfo.risk === 'high' && (
              <AlertTriangle size={14} className="text-error" />
            )}
          </div>

          {/* Input preview */}
          <div className="mt-1">
            <code className="text-sm bg-background/50 px-2 py-0.5 rounded block truncate">
              {formatInput()}
            </code>
          </div>

          {/* Expandable details */}
          {toolInput && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 mt-2 text-xs opacity-70 hover:opacity-100"
            >
              {showDetails ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          )}

          {showDetails && toolInput && (
            <pre className="mt-2 text-xs bg-background/50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(toolInput, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-current/20">
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     bg-success text-white hover:bg-success/90
                     disabled:opacity-50 disabled:cursor-not-allowed
                     text-sm font-medium transition-colors"
        >
          <ShieldCheck size={14} />
          Approve
        </button>

        <button
          onClick={handleReject}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     bg-error text-white hover:bg-error/90
                     disabled:opacity-50 disabled:cursor-not-allowed
                     text-sm font-medium transition-colors"
        >
          <ShieldX size={14} />
          Reject
        </button>

        <div className="flex-1" />

        <button
          onClick={handleAlwaysAllow}
          disabled={isProcessing}
          className="text-xs opacity-70 hover:opacity-100 underline"
        >
          Always allow {toolName}
        </button>
      </div>
    </div>
  )
}
