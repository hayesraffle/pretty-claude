import { useEffect, useRef } from 'react'
import { Send } from 'lucide-react'

export default function InputBox({ onSend, disabled, value = '', onChange, onHistoryNavigate }) {
  const textareaRef = useRef(null)

  // Focus textarea when value changes from quick action
  useEffect(() => {
    if (value && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = value.length
      textareaRef.current.selectionEnd = value.length
    }
  }, [value])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSend(value.trim())
      onChange?.('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    } else if (e.key === 'ArrowUp' && onHistoryNavigate) {
      const textarea = textareaRef.current
      if (textarea && (textarea.selectionStart === 0 || !value.includes('\n'))) {
        e.preventDefault()
        onHistoryNavigate('up')
      }
    } else if (e.key === 'ArrowDown' && onHistoryNavigate) {
      const textarea = textareaRef.current
      if (textarea && (textarea.selectionEnd === value.length || !value.includes('\n'))) {
        e.preventDefault()
        onHistoryNavigate('down')
      }
    }
  }

  const handleChange = (e) => {
    onChange?.(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Input container - Google AI Mode style */}
        <div className="relative flex items-end gap-2 p-1.5 rounded-[28px] bg-surface border border-border
                        transition-all duration-200 hover:border-text-muted focus-within:border-accent">
          <div className="flex-1 pl-4">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={disabled}
              rows={1}
              className="w-full py-2.5 bg-transparent text-[16px] leading-[24px]
                         focus:outline-none resize-none text-text
                         placeholder:text-text-placeholder
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px', maxHeight: '160px' }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
              }}
            />
          </div>

          {/* Send button - circular CTA */}
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center
                       bg-cta text-cta-text
                       hover:bg-cta-hover active:scale-95
                       disabled:opacity-38 disabled:cursor-not-allowed disabled:active:scale-100
                       transition-all duration-200"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Hints */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-text-muted">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface text-[10px] font-mono">Enter</kbd>
            {' '}to send
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface text-[10px] font-mono">Shift+Enter</kbd>
            {' '}for new line
          </span>
        </div>
      </div>
    </form>
  )
}
