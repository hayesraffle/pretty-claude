import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, FolderOpen, Check } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'

const PERMISSION_MODES = [
  {
    value: 'bypassPermissions',
    label: 'Bypass All',
    description: 'Auto-approve all tools',
    color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  {
    value: 'acceptEdits',
    label: 'Accept Edits',
    description: 'Ask for writes only',
    color: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  {
    value: 'default',
    label: 'Ask Each',
    description: 'Ask for every tool',
    color: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  {
    value: 'plan',
    label: 'Plan Mode',
    description: 'Plan before executing',
    color: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
]

export default function SettingsPanel({ isOpen, onClose, workingDir, onChangeWorkingDir }) {
  const { permissionMode, setPermissionMode, showToolDetails, setShowToolDetails } = useSettings()
  const [localWorkingDir, setLocalWorkingDir] = useState(workingDir || '')

  useEffect(() => {
    setLocalWorkingDir(workingDir || '')
  }, [workingDir])

  if (!isOpen) return null

  const handleWorkingDirChange = () => {
    if (localWorkingDir && localWorkingDir !== workingDir) {
      onChangeWorkingDir?.(localWorkingDir)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-72 bg-background z-50 shadow-lg animate-slide-left overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-background">
          <span className="text-sm font-medium text-text-muted">Settings</span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-text/5 text-text-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pb-4 space-y-5">
          {/* Permission Mode */}
          <div>
            <div className="text-xs text-text-muted mb-2">Permission Mode</div>
            <div className="grid grid-cols-2 gap-1.5">
              {PERMISSION_MODES.map((mode) => {
                const isSelected = permissionMode === mode.value
                return (
                  <button
                    key={mode.value}
                    onClick={() => setPermissionMode(mode.value)}
                    className={`relative text-left px-2.5 py-2 rounded-lg transition-all ${
                      isSelected
                        ? mode.color
                        : 'hover:bg-text/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${mode.dot}`} />
                      <span className="text-xs font-medium">{mode.label}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5 ml-3">
                      {mode.description}
                    </div>
                    {isSelected && (
                      <Check size={12} className="absolute top-2 right-2 opacity-60" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tool Details */}
          <div>
            <div className="text-xs text-text-muted mb-2">Tool Details</div>
            <button
              onClick={() => setShowToolDetails(!showToolDetails)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-text/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                {showToolDetails ? (
                  <Eye size={14} className="text-text-muted" />
                ) : (
                  <EyeOff size={14} className="text-text-muted" />
                )}
                <span className="text-xs">
                  {showToolDetails ? 'Showing tool calls' : 'Hidden by default'}
                </span>
              </div>
              <div className={`w-8 h-4 rounded-full transition-colors ${
                showToolDetails ? 'bg-accent' : 'bg-border'
              }`}>
                <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${
                  showToolDetails ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'
                }`} />
              </div>
            </button>
          </div>

          {/* Working Directory */}
          <div>
            <div className="text-xs text-text-muted mb-2">Working Directory</div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={localWorkingDir}
                onChange={(e) => setLocalWorkingDir(e.target.value)}
                placeholder="/path/to/project"
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-text/5
                           focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              <button
                onClick={handleWorkingDirChange}
                disabled={!localWorkingDir || localWorkingDir === workingDir}
                className="px-2 py-1.5 rounded-lg bg-text/5 hover:bg-text/10
                           disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Apply"
              >
                <FolderOpen size={14} />
              </button>
            </div>
          </div>

          {/* Shortcuts */}
          <div>
            <div className="text-xs text-text-muted mb-2">Shortcuts</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-text-muted">Send</span>
                <kbd className="px-1.5 py-0.5 bg-text/5 rounded text-[10px]">Enter</kbd>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-text-muted">New line</span>
                <kbd className="px-1.5 py-0.5 bg-text/5 rounded text-[10px]">Shift+Enter</kbd>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-text-muted">History</span>
                <kbd className="px-1.5 py-0.5 bg-text/5 rounded text-[10px]">↑ ↓</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
