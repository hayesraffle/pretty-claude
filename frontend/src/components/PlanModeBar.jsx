import { FileText, CheckCircle, Clock } from 'lucide-react'

export default function PlanModeBar({ planFile, planReady, permissionMode, onApprovePlan }) {
  // Show bar when in plan mode (permission mode) or when plan file is set
  const showBar = permissionMode === 'plan' || planFile

  if (!showBar) return null

  return (
    <div className={`flex items-center gap-3 px-4 py-2 border-b ${
      planReady
        ? 'bg-success/10 border-success/30'
        : 'bg-purple-500/10 border-purple-500/30'
    }`}>
      {planReady ? (
        <CheckCircle size={16} className="text-success" />
      ) : (
        <Clock size={16} className="text-purple-500 animate-pulse" />
      )}
      <span className="text-sm text-text">
        {planReady ? (
          <>Plan ready for approval</>
        ) : (
          <>Planning in progress...</>
        )}
        {planFile && (
          <code className="ml-2 text-text-muted text-xs">{planFile}</code>
        )}
      </span>
      <div className="flex-1" />
      {planReady && (
        <button
          onClick={onApprovePlan}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg
                     bg-success text-white hover:bg-success/90 transition-colors
                     shadow-sm hover:shadow-md"
        >
          <CheckCircle size={14} />
          Approve & Execute
        </button>
      )}
    </div>
  )
}
