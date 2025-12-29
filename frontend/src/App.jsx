import { useState, useEffect, useRef } from 'react'
import { Wifi, WifiOff, Loader2, Trash2, Square, Sun, Moon, FolderOpen, Code, Type } from 'lucide-react'
import Chat from './components/Chat'
import InputBox from './components/InputBox'
import ExportMenu from './components/ExportMenu'
import Sidebar from './components/Sidebar'
import FileBrowser from './components/FileBrowser'
import { useWebSocket } from './hooks/useWebSocket'
import { useDarkMode } from './hooks/useDarkMode'
import { useCommandHistory } from './hooks/useCommandHistory'
import { useConversationStorage } from './hooks/useConversationStorage'
import { useCodeDisplayMode } from './contexts/CodeDisplayContext'

function App() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false)
  const { status, isStreaming, sendMessage, stopGeneration, onEvent } = useWebSocket()
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const { globalMode, toggleGlobalMode } = useCodeDisplayMode()
  const { addToHistory, navigateHistory } = useCommandHistory()
  const {
    conversations,
    currentId,
    saveConversation,
    loadConversation,
    newConversation,
    deleteConversation,
  } = useConversationStorage()
  const streamingMessageRef = useRef('')
  const autoSaveRef = useRef(null)

  // Handle incoming WebSocket events (new JSON streaming format)
  useEffect(() => {
    onEvent((event) => {
      if (event.type === 'system' && event.subtype === 'init') {
        // Session started - create empty assistant message
        streamingMessageRef.current = ''
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: '',
          events: [], // Store raw events for tool call rendering
          timestamp: new Date()
        }])
      } else if (event.type === 'assistant') {
        // Assistant message with content (text or tool_use)
        const message = event.message || {}
        const content = message.content || []

        // Store the event for tool call rendering
        setMessages((prev) => {
          const updated = [...prev]
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            const lastMsg = updated[updated.length - 1]
            const newEvents = [...(lastMsg.events || []), event]

            // Extract text content for display
            let textContent = ''
            for (const evt of newEvents) {
              const evtContent = evt.message?.content || []
              for (const item of evtContent) {
                if (item.type === 'text') {
                  textContent += item.text
                }
              }
            }

            updated[updated.length - 1] = {
              ...lastMsg,
              content: textContent,
              events: newEvents,
            }
          }
          return updated
        })
      } else if (event.type === 'user') {
        // Tool result - store for rendering
        setMessages((prev) => {
          const updated = [...prev]
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            const lastMsg = updated[updated.length - 1]
            updated[updated.length - 1] = {
              ...lastMsg,
              events: [...(lastMsg.events || []), event],
            }
          }
          return updated
        })
      } else if (event.type === 'result') {
        // Session complete - auto-save
        if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
        autoSaveRef.current = setTimeout(() => {
          setMessages((current) => {
            if (current.length > 0) saveConversation(current)
            return current
          })
        }, 1000)
      } else if (event.type === 'system' && event.subtype === 'error') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `**Error:** ${event.content}`, timestamp: new Date() },
        ])
      }
    })
  }, [onEvent, saveConversation])

  const handleSend = (message) => {
    addToHistory(message)
    setMessages((prev) => [...prev, { role: 'user', content: message, timestamp: new Date() }])

    if (status === 'connected') {
      sendMessage(message)
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `**Not connected to backend.**

Start the backend server to connect to Claude Code:

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
\`\`\`

Then refresh this page.`,
            timestamp: new Date(),
          },
        ])
      }, 500)
    }
  }

  const handleClear = () => {
    setMessages([])
  }

  const handleStop = () => {
    stopGeneration()
  }

  const handleQuickAction = (prompt) => {
    setInputValue(prompt + ' ')
  }

  const handleHistoryNavigate = (direction) => {
    const historicalValue = navigateHistory(direction, inputValue)
    if (historicalValue !== null) {
      setInputValue(historicalValue)
    }
  }

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMessage && status === 'connected') {
      setMessages((prev) => {
        const lastAssistantIdx = prev.map(m => m.role).lastIndexOf('assistant')
        if (lastAssistantIdx >= 0) {
          return prev.slice(0, lastAssistantIdx)
        }
        return prev
      })
      sendMessage(lastUserMessage.content)
    }
  }

  const handleEditMessage = (index, newContent) => {
    setMessages((prev) => {
      const updated = prev.slice(0, index + 1)
      updated[index] = { ...updated[index], content: newContent, timestamp: new Date() }
      return updated
    })

    if (status === 'connected') {
      addToHistory(newContent)
      sendMessage(newContent)
    }
  }

  const handleSelectConversation = (id) => {
    const loaded = loadConversation(id)
    if (loaded) {
      setMessages(loaded.map(m => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
      })))
    }
  }

  const handleNewConversation = () => {
    // Save current if has messages
    if (messages.length > 0) {
      saveConversation(messages)
    }
    setMessages([])
    newConversation()
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={deleteConversation}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="flex-shrink-0 h-14 px-4 border-b border-border bg-background flex items-center">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Pretty Code" className="w-8 h-8 rounded-lg" />
              <h1 className="text-[18px] font-medium text-text">pretty-code</h1>
            </div>

            <div className="flex items-center gap-4">
              {isStreaming && (
                <button
                  onClick={handleStop}
                  className="btn-secondary text-error border-error/30 hover:bg-error/10"
                >
                  <Square size={14} fill="currentColor" />
                  Stop
                </button>
              )}

              {!isStreaming && <ExportMenu messages={messages} />}

              {messages.length > 0 && !isStreaming && (
                <button
                  onClick={handleClear}
                  className="btn-icon"
                  title="Clear conversation"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <button
                onClick={() => setFileBrowserOpen(true)}
                className="btn-icon"
                title="Browse files"
              >
                <FolderOpen size={18} />
              </button>

              <button
                onClick={toggleGlobalMode}
                className="btn-icon"
                title={globalMode === 'pretty' ? 'Switch to monospace code' : 'Switch to pretty code'}
              >
                {globalMode === 'pretty' ? <Code size={18} /> : <Type size={18} />}
              </button>

              <button
                onClick={toggleDarkMode}
                className="btn-icon"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="flex items-center gap-2 text-[13px]">
                {status === 'connected' ? (
                  <span className="flex items-center gap-1.5 text-success">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    Connected
                  </span>
                ) : status === 'connecting' ? (
                  <span className="flex items-center gap-1.5 text-warning">
                    <Loader2 size={14} className="animate-spin" />
                    Connecting
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-text-muted">
                    <span className="w-2 h-2 rounded-full bg-text-muted"></span>
                    Offline
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat area */}
        <Chat
          messages={messages}
          isStreaming={isStreaming}
          onQuickAction={handleQuickAction}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
        />

        {/* Input */}
        <InputBox
          onSend={handleSend}
          disabled={isStreaming}
          value={inputValue}
          onChange={setInputValue}
          onHistoryNavigate={handleHistoryNavigate}
        />
      </div>

      {/* File Browser Modal */}
      <FileBrowser
        isOpen={fileBrowserOpen}
        onClose={() => setFileBrowserOpen(false)}
        onFileSelect={(path) => {
          // Insert file path into input
          setInputValue((prev) => prev + (prev ? ' ' : '') + path)
        }}
      />
    </div>
  )
}

export default App
