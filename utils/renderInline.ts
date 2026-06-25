// Render a component prop string (e.g. <Bra title="...">) as inline markdown
// so that math ($...$), **bold**, *italic*, and `code` in titles render exactly
// like slide body text. Slidev's markdown+KaTeX pipeline only runs over slot
// content, never over component attributes — props arrive as plain strings, so
// a title like "$H^\perp$" would otherwise show the dollar signs verbatim.
//
// We keep our own markdown-it instance (module-scoped, created once) configured
// with a minimal inline-math rule that delegates to KaTeX, mirroring Slidev's
// own math_inline handling (displayMode:false, throwOnError:false) for visual
// parity.

import MarkdownIt from 'markdown-it'
import katex from 'katex'

type StateInline = {
  src: string
  pos: number
  posMax: number
  pending: string
  push(type: string, tag: string, nesting: number): { content: string; markup: string }
}

// Inline `$...$` math rule. Recognises a pair of unescaped dollar signs with
// non-empty, non-trivial content, and emits a `math_inline` token rendered by
// KaTeX. Escaped dollars (`\$`) are left for markdown-it's escape rule.
function mathInlineRule(state: StateInline, silent: boolean): boolean {
  if (state.src[state.pos] !== '$')
    return false

  // Reject `$$` (display math) and a space/blank right after the opening `$`.
  const next = state.src[state.pos + 1]
  if (next === '$' || next === ' ' || next === '\t' || next === '\n' || next === undefined)
    return false

  // Scan for the closing `$`, honouring backslash escapes.
  let pos = state.pos + 1
  let end = -1
  while (pos < state.posMax) {
    if (state.src[pos] === '\\') {
      pos += 2
      continue
    }
    if (state.src[pos] === '$') {
      end = pos
      break
    }
    pos += 1
  }
  if (end === -1)
    return false

  const content = state.src.slice(state.pos + 1, end)
  if (!content.trim())
    return false

  if (!silent) {
    const token = state.push('math_inline', 'math', 0)
    token.content = content
    token.markup = '$'
  }
  state.pos = end + 1
  return true
}

function renderMath(latex: string): string {
  try {
    return katex.renderToString(latex, { displayMode: false, throwOnError: false })
  }
  catch {
    return latex
  }
}

const md = new MarkdownIt({
  html: false, // escape raw HTML in titles — props are author-controlled but not trusted markup
  linkify: false,
  breaks: false,
})
md.inline.ruler.after('escape', 'math_inline', mathInlineRule as MarkdownIt.RuleInline)
md.renderer.rules.math_inline = (tokens, idx) => renderMath(tokens[idx].content)

export function renderInline(src: string): string {
  return md.renderInline(src ?? '')
}
