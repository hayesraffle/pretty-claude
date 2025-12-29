import { useState, useEffect } from 'react'
import { Settings, X, Shield, Eye, EyeOff, FolderOpen, RefreshCw } from 'lucide-react'
import { useSettings } from '../contexts/SettingsContext'

const PERMISSION_MODES = [
  { value: 'bypassPermissions', label: 'Bypass All', description: 'Auto-approve all tool calls' },
  { value: 'acceptEdits', label: 'Accept Edits', description: 'Ask only for write operations' },
  { value: 'default', label: 'Ask Each', description: 'Ask permission for every tool' },
  { value: 'plan', label: 'Plan Mode', description: 'Create a plan before executing' },
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
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border z-50 shadow-xl animate-slide-left overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-accent" />
            <span className="font-medium">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="btn-icon w-8 h-8"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Permission Mode */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield size={16} className="text-accent" />
              Permission Mode
            </div>
            <p className="text-xs text-text-muted mb-2">
              Control how Claude asks for permission to use tools
            </p>
            <div className="space-y-1">
              {PERMISSION_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setPermissionMode(mode.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    permissionMode === mode.value
                      ? 'bg-accent/10 border border-accent/30'
                      : 'bg-background border border-border hover:border-accent/30'
                  }`}
                >
                  <div className="font-medium text-sm">{mode.label}</div>
                  <div className="text-xs text-text-muted">{mode.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tool Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              {showToolDetails ? <Eye size={16} className="text-accent" /> : <EyeOff size={16} className="text-text-muted" />}
              Tool Details
            </div>
            <p className="text-xs text-text-muted mb-2">
              Show or hide detailed tool call information in messages
            </p>
            <button
              onClick={() => setShowToolDetails(!showToolDetails)}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                showToolDetails
                  ? 'bg-accent/10 border-accent/30'
                  : 'bg-background border-border'
              }`}
            >
              <div className="font-medium text-sm">
                {showToolDetails ? 'Visible' : 'Hidden'}
              </div>
              <div className="text-xs text-text-muted">
                {showToolDetails
                  ? 'Tool calls are expanded in the chat'
                  : 'Tool calls are collapsed by default'
                }
              </div>
            </button>
          </div>

          {/* Working Directory */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FolderOpen size={16} className="text-accent" />
              Working Directory
            </div>
            <p className="text-xs text-text-muted mb-2">
              The directory Claude will use for file operations
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={localWorkingDir}
                onChange={(e) => setLocalWorkingDir(e.target.value)}
                placeholder="/path/to/project"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background
                           focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleWorkingDirChange}
                disabled={!localWorkingDir || localWorkingDir === workingDir}
                className="btn-icon w-10 h-10 disabled:opacity-50"
                title="Apply"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            {workingDir && (
              <div className="text-xs text-text-muted truncate">
                Current: {workingDir}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Keyboard Shortcuts</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Send message</span>
                <kbd className="px-2 py-0.5 bg-border rounded text-xs">Enter</kbd>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">New line</span>
                <kbd className="px-2 py-0.5 bg-border rounded text-xs">Shift+Enter</kbd>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Previous message</span>
                <kbd className="px-2 py-0.5 bg-border rounded text-xs">↑</kbd>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Next message</span>
                <kbd className="px-2 py-0.5 bg-border rounded text-xs">↓</kbd>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="pt-4 border-t border-border text-center">
            <div className="text-sm font-medium">pretty-code</div>
            <div className="text-xs text-text-muted mt-1">
              A beautiful GUI for Claude Code CLI
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
