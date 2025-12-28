import { useState, useEffect } from 'react'
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  File,
  ChevronRight,
  ChevronDown,
  X,
  RefreshCw,
  Home,
} from 'lucide-react'

// File type icons
const FILE_ICONS = {
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  py: FileCode,
  json: FileCode,
  md: FileText,
  txt: FileText,
  default: File,
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  return FILE_ICONS[ext] || FILE_ICONS.default
}

// Mock file tree - in production, this would come from the backend
const MOCK_TREE = {
  name: 'project',
  type: 'directory',
  children: [
    {
      name: 'src',
      type: 'directory',
      children: [
        { name: 'App.jsx', type: 'file' },
        { name: 'main.jsx', type: 'file' },
        { name: 'index.css', type: 'file' },
        {
          name: 'components',
          type: 'directory',
          children: [
            { name: 'Chat.jsx', type: 'file' },
            { name: 'Message.jsx', type: 'file' },
            { name: 'CodeBlock.jsx', type: 'file' },
          ],
        },
        {
          name: 'hooks',
          type: 'directory',
          children: [
            { name: 'useWebSocket.js', type: 'file' },
            { name: 'useDarkMode.js', type: 'file' },
          ],
        },
      ],
    },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'vite.config.js', type: 'file' },
  ],
}

function TreeNode({ node, path = '', level = 0, onSelect, selectedPath }) {
  const [isOpen, setIsOpen] = useState(level < 2)
  const fullPath = path ? `${path}/${node.name}` : node.name
  const isSelected = selectedPath === fullPath
  const isDirectory = node.type === 'directory'

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen)
    } else {
      onSelect(fullPath)
    }
  }

  const Icon = isDirectory
    ? (isOpen ? FolderOpen : Folder)
    : getFileIcon(node.name)

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm
                   transition-colors hover:bg-surface group
                   ${isSelected ? 'bg-accent/10 text-accent' : 'text-text'}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {isDirectory && (
          <span className="text-text-muted w-3">
            {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
        {!isDirectory && <span className="w-3" />}
        <Icon
          size={14}
          className={isDirectory ? 'text-yellow-500' : 'text-text-muted'}
        />
        <span className="truncate">{node.name}</span>
      </button>

      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode
              key={i}
              node={child}
              path={fullPath}
              level={level + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileBrowser({ isOpen, onClose, onFileSelect }) {
  const [selectedPath, setSelectedPath] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelect = async (path) => {
    setSelectedPath(path)
    setIsLoading(true)

    // Simulate loading file content
    // In production, this would fetch from backend
    setTimeout(() => {
      setFileContent(`// Contents of ${path}\n\n// This is a placeholder.\n// Connect to backend to view actual file contents.`)
      setIsLoading(false)
    }, 300)

    onFileSelect?.(path)
  }

  const handleInsertPath = () => {
    if (selectedPath) {
      // This would insert the path into the input
      navigator.clipboard.writeText(selectedPath)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-2xl border border-border w-[900px] h-[600px] flex overflow-hidden">
        {/* Left panel - Tree */}
        <div className="w-64 border-r border-border flex flex-col">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home size={14} className="text-text-muted" />
              <span className="text-sm font-medium text-text">Files</span>
            </div>
            <button
              className="p-1 rounded hover:bg-surface text-text-muted hover:text-text"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <TreeNode
              node={MOCK_TREE}
              onSelect={handleSelect}
              selectedPath={selectedPath}
            />
          </div>
        </div>

        {/* Right panel - Content */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedPath ? (
                <>
                  <FileCode size={14} className="text-text-muted" />
                  <span className="text-sm text-text">{selectedPath}</span>
                </>
              ) : (
                <span className="text-sm text-text-muted">Select a file to view</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-text-muted">
                <RefreshCw size={20} className="animate-spin" />
              </div>
            ) : fileContent ? (
              <pre className="text-sm font-mono text-text whitespace-pre-wrap">
                {fileContent}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-text-muted">
                <Folder size={48} className="mb-4 opacity-30" />
                <p className="text-sm">Select a file from the tree to view its contents</p>
                <p className="text-xs mt-2 opacity-60">
                  You can reference files in your prompts
                </p>
              </div>
            )}
          </div>

          {/* Footer with actions */}
          {selectedPath && (
            <div className="px-4 py-2 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={handleInsertPath}
                className="px-3 py-1.5 text-sm rounded-lg bg-surface hover:bg-surface/80
                         text-text border border-border transition-colors"
              >
                Copy Path
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm rounded-lg bg-accent hover:bg-accent-hover
                         text-white transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
