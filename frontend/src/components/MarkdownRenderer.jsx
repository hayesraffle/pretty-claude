import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'
import SemanticBlock, { detectSemanticType } from './SemanticBlock'

// Patterns to detect tool operations in text
const TOOL_PATTERNS = [
  { regex: /^(Reading|Read)\s+(?:file\s+)?[`']?([^`'\n]+)[`']?/i, type: 'read', getTitle: (m) => m[2] },
  { regex: /^(Editing|Edit|Updated|Updating)\s+(?:file\s+)?[`']?([^`'\n]+)[`']?/i, type: 'file_edit', getTitle: (m) => m[2] },
  { regex: /^(Running|Ran|Executing)\s+(?:command\s+)?[`']?(.+)[`']?/i, type: 'bash', getTitle: (m) => m[2] },
  { regex: /^(Searching|Search|Grep|Glob)\s+(?:for\s+)?[`']?(.+)[`']?/i, type: 'search', getTitle: (m) => m[2] },
  { regex: /^(Created|Creating)\s+(?:file\s+|directory\s+)?[`']?([^`'\n]+)[`']?/i, type: 'success', getTitle: (m) => m[2] },
  { regex: /^(Error|Failed|Not found)[:.]?\s*(.+)?/i, type: 'error', getTitle: (m) => m[2] || '' },
]

function detectToolPattern(text) {
  for (const pattern of TOOL_PATTERNS) {
    const match = text.match(pattern.regex)
    if (match) {
      return { type: pattern.type, title: pattern.getTitle(match), match }
    }
  }
  return null
}

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Code blocks
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : 'text'
          const code = String(children).replace(/\n$/, '')

          if (!inline && (match || code.includes('\n'))) {
            return <CodeBlock code={code} language={language} />
          }

          // Inline code
          return (
            <code
              className="px-1.5 py-0.5 rounded bg-code-bg text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          )
        },

        // Headings
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-6 mb-4 text-text">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mt-5 mb-3 text-text">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mt-4 mb-2 text-text">{children}</h3>
        ),

        // Paragraphs - with semantic block detection
        p: ({ children }) => {
          // Get text content for pattern detection
          const textContent = typeof children === 'string'
            ? children
            : Array.isArray(children)
              ? children.map(c => typeof c === 'string' ? c : '').join('')
              : ''

          const toolMatch = detectToolPattern(textContent)

          if (toolMatch) {
            return (
              <SemanticBlock
                type={toolMatch.type}
                title={toolMatch.title}
                defaultCollapsed={toolMatch.type === 'read'}
              >
                <p className="leading-relaxed text-text">{children}</p>
              </SemanticBlock>
            )
          }

          return <p className="my-3 leading-relaxed">{children}</p>
        },

        // Lists
        ul: ({ children }) => (
          <ul className="my-3 ml-4 list-disc space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-3 ml-4 list-decimal space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-accent hover:text-accent-hover underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-accent pl-4 my-4 italic text-text-muted">
            {children}
          </blockquote>
        ),

        // Horizontal rule
        hr: () => <hr className="my-6 border-border" />,

        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),

        // Tables
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="min-w-full border border-border rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-surface">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-semibold border-b border-border">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-b border-border">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
