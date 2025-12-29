import { useState } from 'react'
import {
  FileText,
  Edit3,
  Terminal,
  Search,
  Globe,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FolderOpen,
  Sparkles,
} from 'lucide-react'
import CodeBlock from './CodeBlock'

// Tool icon mapping
const TOOL_ICONS = {
  Read: FileText,
  Edit: Edit3,
  Write: FileText,
  Bash: Terminal,
  Glob: FolderOpen,
  Grep: Search,
  WebFetch: Globe,
  WebSearch: Globe,
  TodoWrite: CheckSquare,
  Task: Sparkles,
}

// Tool display names
const TOOL_NAMES = {
  Read: 'Read File',
  Edit: 'Edit File',
  Write: 'Write File',
  Bash: 'Run Command',
  Glob: 'Find Files',
  Grep: 'Search Code',
  WebFetch: 'Fetch URL',
  WebSearch: 'Web Search',
  TodoWrite: 'Update Todos',
  Task: 'Spawn Agent',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="btn-icon w-6 h-6" title="Copy">
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-hover
                   text-left text-sm font-medium"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {Icon && <Icon size={14} className="text-text-muted" />}
        <span>{title}</span>
      </button>
      {isOpen && <div className="p-3 border-t border-border">{children}</div>}
    </div>
  )
}

// Read file renderer
function ReadRenderer({ input, result }) {
  const filePath = input?.file_path || 'Unknown file'
  const content = result?.content || result?.file?.content || ''
  const language = getLanguageFromPath(filePath)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <code className="text-xs text-text-muted bg-surface px-2 py-1 rounded">
          {filePath}
        </code>
        <CopyButton text={content} />
      </div>
      {content && (
        <div className="max-h-60 overflow-auto">
          <CodeBlock code={content} language={language} />
        </div>
      )}
    </div>
  )
}

// Edit file renderer with diff
function EditRenderer({ input, result }) {
  const filePath = input?.file_path || 'Unknown file'
  const oldString = input?.old_string || ''
  const newString = input?.new_string || ''

  return (
    <div className="space-y-2">
      <code className="text-xs text-text-muted bg-surface px-2 py-1 rounded block">
        {filePath}
      </code>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-error font-medium mb-1">- Removed</div>
          <pre className="text-xs bg-error/10 text-error p-2 rounded overflow-auto max-h-40">
            {oldString || '(empty)'}
          </pre>
        </div>
        <div>
          <div className="text-xs text-success font-medium mb-1">+ Added</div>
          <pre className="text-xs bg-success/10 text-success p-2 rounded overflow-auto max-h-40">
            {newString || '(empty)'}
          </pre>
        </div>
      </div>
    </div>
  )
}

// Write file renderer
function WriteRenderer({ input }) {
  const filePath = input?.file_path || 'Unknown file'
  const content = input?.content || ''
  const language = getLanguageFromPath(filePath)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <code className="text-xs text-text-muted bg-surface px-2 py-1 rounded">
          {filePath}
        </code>
        <span className="text-xs text-success">New file</span>
      </div>
      {content && (
        <div className="max-h-60 overflow-auto">
          <CodeBlock code={content} language={language} />
        </div>
      )}
    </div>
  )
}

// Bash command renderer
function BashRenderer({ input, result }) {
  const command = input?.command || ''
  const output = result?.content || ''

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-accent font-mono text-sm">$</span>
        <code className="text-sm font-mono flex-1">{command}</code>
        <CopyButton text={command} />
      </div>
      {output && (
        <pre className="text-xs bg-surface p-3 rounded overflow-auto max-h-60 font-mono">
          {output}
        </pre>
      )}
    </div>
  )
}

// Glob/Grep renderer
function SearchRenderer({ toolName, input, result }) {
  const pattern = input?.pattern || ''
  const path = input?.path || '.'
  const content = result?.content || ''

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-muted">{toolName === 'Glob' ? 'Pattern:' : 'Search:'}</span>
        <code className="bg-surface px-2 py-0.5 rounded">{pattern}</code>
        <span className="text-text-muted">in</span>
        <code className="bg-surface px-2 py-0.5 rounded">{path}</code>
      </div>
      {content && (
        <pre className="text-xs bg-surface p-3 rounded overflow-auto max-h-40 font-mono">
          {content}
        </pre>
      )}
    </div>
  )
}

// TodoWrite renderer
function TodoRenderer({ input }) {
  const todos = input?.todos || []

  return (
    <div className="space-y-1">
      {todos.map((todo, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-2 text-sm p-2 rounded ${
            todo.status === 'completed'
              ? 'bg-success/10 text-success'
              : todo.status === 'in_progress'
              ? 'bg-accent/10 text-accent'
              : 'bg-surface text-text-muted'
          }`}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            {todo.status === 'completed' ? '✓' : todo.status === 'in_progress' ? '→' : '○'}
          </span>
          <span>{todo.content}</span>
        </div>
      ))}
    </div>
  )
}

// Task/Agent renderer
function TaskRenderer({ input }) {
  const description = input?.description || 'Spawning agent...'
  const subagentType = input?.subagent_type || 'general-purpose'

  return (
    <div className="flex items-center gap-2 text-sm">
      <Sparkles size={14} className="text-accent" />
      <span className="text-text-muted">Agent ({subagentType}):</span>
      <span>{description}</span>
    </div>
  )
}

// Generic fallback renderer
function GenericRenderer({ toolName, input, result }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-text-muted">Input:</div>
      <pre className="text-xs bg-surface p-2 rounded overflow-auto max-h-40">
        {JSON.stringify(input, null, 2)}
      </pre>
      {result && (
        <>
          <div className="text-xs text-text-muted">Result:</div>
          <pre className="text-xs bg-surface p-2 rounded overflow-auto max-h-40">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </>
      )}
    </div>
  )
}

// Helper to detect language from file path
function getLanguageFromPath(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const langMap = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    json: 'json',
    md: 'markdown',
    css: 'css',
    html: 'html',
    sh: 'bash',
    bash: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
  }
  return langMap[ext] || 'text'
}

// Main ToolCallView component
export default function ToolCallView({ toolUse, toolResult, isCompact = false }) {
  const toolName = toolUse?.name || 'Unknown'
  const input = toolUse?.input || {}
  const result = toolResult?.content || toolResult

  const Icon = TOOL_ICONS[toolName] || Terminal
  const displayName = TOOL_NAMES[toolName] || toolName

  // Render the appropriate component based on tool type
  const renderContent = () => {
    switch (toolName) {
      case 'Read':
        return <ReadRenderer input={input} result={result} />
      case 'Edit':
        return <EditRenderer input={input} result={result} />
      case 'Write':
        return <WriteRenderer input={input} />
      case 'Bash':
        return <BashRenderer input={input} result={result} />
      case 'Glob':
      case 'Grep':
        return <SearchRenderer toolName={toolName} input={input} result={result} />
      case 'TodoWrite':
        return <TodoRenderer input={input} />
      case 'Task':
        return <TaskRenderer input={input} />
      default:
        return <GenericRenderer toolName={toolName} input={input} result={result} />
    }
  }

  if (isCompact) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted py-1">
        <Icon size={14} />
        <span>{displayName}</span>
        {toolName === 'Read' && input.file_path && (
          <code className="text-xs bg-surface px-1 rounded">{input.file_path.split('/').pop()}</code>
        )}
        {toolName === 'Bash' && input.command && (
          <code className="text-xs bg-surface px-1 rounded truncate max-w-[200px]">{input.command}</code>
        )}
      </div>
    )
  }

  return (
    <CollapsibleSection title={displayName} icon={Icon} defaultOpen={true}>
      {renderContent()}
    </CollapsibleSection>
  )
}
