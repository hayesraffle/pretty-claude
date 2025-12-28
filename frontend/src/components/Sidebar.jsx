import { useState } from 'react'
import {
  MessageSquare,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function Sidebar({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  isCollapsed,
  onToggle,
}) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date

    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (isCollapsed) {
    return (
      <div className="w-14 flex-shrink-0 border-r border-border bg-background flex flex-col items-center py-3 gap-2">
        <button
          onClick={onToggle}
          className="btn-icon"
          title="Expand sidebar"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={onNew}
          className="btn-icon text-accent"
          title="New conversation"
        >
          <Plus size={18} />
        </button>
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto py-2">
          {conversations.slice(0, 5).map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`btn-icon ${
                conv.id === currentId ? 'bg-accent-light text-accent' : ''
              }`}
              title={conv.title}
            >
              <MessageSquare size={16} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-72 flex-shrink-0 border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-[14px] font-medium text-text">History</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNew}
            className="btn-icon w-8 h-8 text-accent"
            title="New conversation"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={onToggle}
            className="btn-icon w-8 h-8"
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageSquare size={24} className="mx-auto mb-3 text-text-muted opacity-40" />
            <p className="text-[13px] text-text-muted">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative mx-2 mb-1 rounded-lg transition-colors ${
                conv.id === currentId ? 'bg-accent-light' : 'hover:bg-surface'
              }`}
            >
              <button
                onClick={() => onSelect(conv.id)}
                className="w-full text-left px-3 py-2.5"
              >
                <div className="flex items-start gap-3">
                  <MessageSquare
                    size={16}
                    className={`mt-0.5 flex-shrink-0 ${
                      conv.id === currentId ? 'text-accent' : 'text-text-muted'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[14px] leading-[20px] truncate ${
                        conv.id === currentId ? 'text-accent font-medium' : 'text-text'
                      }`}
                    >
                      {conv.title}
                    </p>
                    <p className="text-[12px] leading-[16px] text-text-muted mt-0.5">
                      {formatDate(conv.updatedAt)}
                    </p>
                  </div>
                </div>
              </button>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon w-7 h-7
                           opacity-0 group-hover:opacity-100 hover:text-error
                           transition-opacity"
                title="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
