// Token-to-typography mapping for Pretty Code mode
// Maps Prism token types to semantic typography styles

export const TOKEN_STYLES = {
  // === STRUCTURAL (Sans-serif, Bold/Medium) ===
  keyword: 'token-keyword',
  builtin: 'token-builtin',
  'class-name': 'token-class-name',

  // === FUNCTIONAL ===
  function: 'token-function',
  'function-variable': 'token-function',
  method: 'token-function',

  // === LITERALS (Serif, Italic for strings) ===
  string: 'token-string',
  'template-string': 'token-string',
  'template-punctuation': 'token-string',
  char: 'token-string',
  regex: 'token-regex',

  // === NUMERIC ===
  number: 'token-number',
  boolean: 'token-boolean',

  // === COMMENTS ===
  comment: 'token-comment',
  prolog: 'token-comment',
  doctype: 'token-comment',
  cdata: 'token-comment',

  // === VARIABLES/PROPERTIES ===
  variable: 'token-variable',
  property: 'token-property',
  parameter: 'token-parameter',
  constant: 'token-constant',
  symbol: 'token-constant',

  // === OPERATORS/PUNCTUATION ===
  operator: 'token-operator',
  punctuation: 'token-punctuation',

  // === TAGS/ATTRIBUTES (HTML/JSX) ===
  tag: 'token-tag',
  'attr-name': 'token-attr-name',
  'attr-value': 'token-string',
  namespace: 'token-namespace',

  // === TYPES ===
  'maybe-class-name': 'token-class-name',
  'known-class-name': 'token-class-name',

  // === DEFAULT ===
  plain: 'token-plain',
}

// Priority order for resolving token types
const PRIORITY_ORDER = [
  'function', 'class-name', 'keyword', 'builtin',
  'string', 'template-string', 'comment',
  'number', 'boolean', 'constant',
  'tag', 'attr-name',
  'variable', 'property', 'parameter',
  'operator', 'punctuation',
]

/**
 * Get the CSS class for a token based on its types
 * @param {string[]} tokenTypes - Array of token type strings
 * @returns {string} CSS class name
 */
export function getTokenClass(tokenTypes) {
  if (!tokenTypes || tokenTypes.length === 0) {
    return TOKEN_STYLES.plain
  }

  // Check priority order first
  for (const type of PRIORITY_ORDER) {
    if (tokenTypes.includes(type)) {
      return TOKEN_STYLES[type] || TOKEN_STYLES.plain
    }
  }

  // Fallback: check all token types
  for (const type of tokenTypes) {
    if (TOKEN_STYLES[type]) {
      return TOKEN_STYLES[type]
    }
  }

  return TOKEN_STYLES.plain
}

/**
 * Check if a token represents a block-starting keyword
 */
export function isBlockKeyword(content) {
  return ['function', 'class', 'if', 'else', 'for', 'while', 'switch', 'try', 'catch'].includes(content)
}

/**
 * Check if a token is opening/closing braces
 */
export function isBrace(content) {
  return content === '{' || content === '}'
}
