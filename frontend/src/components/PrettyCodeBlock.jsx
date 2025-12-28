import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { ChevronRight } from 'lucide-react'
import { getTokenClass, isBlockKeyword, isBrace } from '../utils/tokenTypography'

export default function PrettyCodeBlock({ code, language = 'javascript', isCollapsed }) {
  const [collapsedBlocks, setCollapsedBlocks] = useState(new Set())

  const toggleBlock = (blockId) => {
    setCollapsedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(blockId)) {
        next.delete(blockId)
      } else {
        next.add(blockId)
      }
      return next
    })
  }

  // Analyze code structure for collapsible blocks
  const analyzeBlocks = (tokens) => {
    const blocks = []
    let braceDepth = 0
    let currentBlock = null

    tokens.forEach((line, lineIndex) => {
      line.forEach((token) => {
        const content = token.content.trim()

        // Start a new block on block keywords
        if (isBlockKeyword(content) && currentBlock === null) {
          currentBlock = {
            startLine: lineIndex,
            keyword: content,
            depth: braceDepth,
          }
        }

        // Track braces
        if (content === '{') {
          if (currentBlock && currentBlock.openBrace === undefined) {
            currentBlock.openBrace = lineIndex
          }
          braceDepth++
        } else if (content === '}') {
          braceDepth--
          if (currentBlock && braceDepth === currentBlock.depth) {
            currentBlock.endLine = lineIndex
            blocks.push({ ...currentBlock, id: `block-${blocks.length}` })
            currentBlock = null
          }
        }
      })
    })

    return blocks
  }

  return (
    <div
      className={`overflow-hidden transition-all duration-200 ${
        isCollapsed ? 'max-h-[240px]' : 'max-h-none'
      }`}
    >
      <Highlight
        theme={themes.github}
        code={code.trim()}
        language={language}
      >
        {({ tokens }) => {
          const blocks = analyzeBlocks(tokens)

          // Create a map of line -> block info for quick lookup
          const lineToBlock = new Map()
          blocks.forEach(block => {
            for (let i = block.openBrace; i <= block.endLine; i++) {
              if (!lineToBlock.has(i)) {
                lineToBlock.set(i, block)
              }
            }
          })

          return (
            <div className="pretty-code">
              {tokens.map((line, lineIndex) => {
                const block = lineToBlock.get(lineIndex)
                const isBlockStart = block && lineIndex === block.openBrace
                const isBlockBody = block && lineIndex > block.openBrace && lineIndex < block.endLine
                const isBlockEnd = block && lineIndex === block.endLine
                const isBlockCollapsed = block && collapsedBlocks.has(block.id)

                // Skip body lines if block is collapsed
                if (isBlockBody && isBlockCollapsed) {
                  return null
                }

                // Skip closing brace if collapsed (we'll show placeholder instead)
                if (isBlockEnd && isBlockCollapsed) {
                  return null
                }

                return (
                  <div key={lineIndex} className="pretty-code-line">
                    {line.map((token, tokenIndex) => {
                      const tokenTypes = token.types || []
                      const cssClass = getTokenClass(tokenTypes)
                      const content = token.content

                      // Add collapse toggle for opening braces
                      if (isBrace(content.trim()) && content.trim() === '{' && isBlockStart) {
                        return (
                          <span key={tokenIndex} className="pretty-code-block-header">
                            <button
                              onClick={() => toggleBlock(block.id)}
                              className="inline-flex items-center"
                            >
                              <ChevronRight
                                className={`pretty-code-block-chevron ${
                                  isBlockCollapsed ? '' : 'rotate-90'
                                }`}
                              />
                            </button>
                            <span className={cssClass}>{content}</span>
                            {isBlockCollapsed && (
                              <span className="pretty-code-block-placeholder">
                                {` ... ${block.endLine - block.openBrace - 1} lines`}
                              </span>
                            )}
                          </span>
                        )
                      }

                      return (
                        <span key={tokenIndex} className={cssClass}>
                          {content}
                        </span>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        }}
      </Highlight>
    </div>
  )
}
