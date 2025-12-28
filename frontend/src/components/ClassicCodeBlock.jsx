import { useState, useEffect } from 'react'
import { Highlight, themes } from 'prism-react-renderer'

export default function ClassicCodeBlock({ code, language = 'javascript', isCollapsed }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()

    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`overflow-hidden transition-all duration-200 ${
        isCollapsed ? 'max-h-[240px]' : 'max-h-none'
      }`}
    >
      <Highlight
        theme={isDark ? themes.nightOwl : themes.github}
        code={code.trim()}
        language={language}
      >
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="p-4 overflow-x-auto text-[13px] leading-[20px] m-0 font-mono"
            style={{ ...style, backgroundColor: 'transparent' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell pr-4 text-text-muted select-none text-right w-8 opacity-50 text-[12px]">
                  {i + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
