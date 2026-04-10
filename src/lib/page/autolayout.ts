import { v4 as uuid } from 'uuid'
import type { Block } from '@/types/page'

type LineKind = 'h1' | 'h2' | 'quote' | 'divider' | 'ul' | 'ol' | 'text'

function classifyLine(line: string): LineKind {
  const t = line.trimStart()
  if (/^#{1}\s/.test(t) && !t.startsWith('##')) return 'h1'
  if (/^#{2}\s/.test(t)) return 'h2'
  if (t.startsWith('> ')) return 'quote'
  if (/^-{3,}$/.test(t.trim()) || /^={3,}$/.test(t.trim())) return 'divider'
  // Unordered list: - item / * item / + item
  if (/^[-*+]\s+\S/.test(t)) return 'ul'
  // Ordered list: 1. item / 1) item
  if (/^\d+[.)]\s+\S/.test(t)) return 'ol'
  return 'text'
}

function extractContent(line: string, kind: LineKind): string {
  if (kind === 'h1') return line.replace(/^#{1}\s+/, '').trim()
  if (kind === 'h2') return line.replace(/^#{2}\s+/, '').trim()
  if (kind === 'quote') return line.replace(/^>\s+/, '').trim()
  if (kind === 'ul') return line.replace(/^[-*+]\s+/, '').trim()
  if (kind === 'ol') return line.replace(/^\d+[.)]\s+/, '').trim()
  return line.trim()
}

function looksLikeHeading(text: string): boolean {
  const len = text.length
  if (len === 0 || len > 30) return false
  // Must not end with sentence-terminal punctuation
  if (/[。.!?！？,，；;…]$/.test(text)) return false
  // Should not contain line breaks
  if (text.includes('\n')) return false
  return true
}

/**
 * Parse raw text into an array of semantic Blocks.
 *
 * Supported markdown-lite syntax:
 *   # Title         → title (first) or heading (subsequent)
 *   ## Subheading   → heading
 *   > Quote text    → quote
 *   ---             → divider
 *   [blank line]    → paragraph break
 *
 * Heuristic auto-detection:
 *   - A section (blank-line-separated) that is a single short line with no
 *     terminal punctuation is promoted to title/heading automatically.
 *   - The very first content block is always promoted to title if no
 *     explicit # marker was found.
 */
interface ParseOptions {
  markdownEnabled?: boolean
}

export function parseTextToBlocks(text: string, options: ParseOptions = {}): Block[] {
  if (!text.trim()) return []
  const markdownEnabled = options.markdownEnabled ?? true

  // Split text into paragraphs/sections by two or more newlines
  const rawSections = text.split(/\n{2,}/)
  const result: Block[] = []
  let titleUsed = false

  for (const section of rawSections) {
    const trimmed = section.trim()
    if (!trimmed) continue

    const lines = trimmed.split('\n')

    // Accumulate text lines within section
    const textLines: string[] = []

    const flushText = () => {
      if (textLines.length === 0) return
      const content = textLines.join('\n').trim()
      textLines.length = 0
      if (!content) return

      // Single-line section heuristic: short, no punctuation → heading
      if (looksLikeHeading(content)) {
        if (!titleUsed) {
          result.push({ id: uuid(), type: 'title', content, style: {} })
          titleUsed = true
        } else {
          result.push({ id: uuid(), type: 'heading', content, style: {} })
        }
      } else {
        result.push({ id: uuid(), type: 'paragraph', content, style: {} })
      }
    }

    // Pending list items (flushed when list type changes or non-list line encountered)
    let pendingListItems: string[] = []
    let pendingListOrdered = false

    const flushList = () => {
      if (pendingListItems.length === 0) return
      const items = [...pendingListItems]
      pendingListItems = []
      result.push({
        id: uuid(),
        type: 'list',
        content: items.join('\n'),
        listItems: items,
        listOrdered: pendingListOrdered,
        style: {},
      })
    }

    for (const line of lines) {
      const kind = markdownEnabled ? classifyLine(line) : 'text'

      if (kind === 'ul' || kind === 'ol') {
        const isOrdered = kind === 'ol'
        if (pendingListItems.length > 0 && pendingListOrdered !== isOrdered) {
          flushList()
        }
        if (pendingListItems.length === 0) {
          flushText()
        }
        pendingListOrdered = isOrdered
        pendingListItems.push(extractContent(line, kind))
        continue
      }

      // Non-list line: flush any pending list
      flushList()

      if (kind === 'divider') {
        flushText()
        result.push({ id: uuid(), type: 'divider', content: '' })
        continue
      }

      if (kind === 'h1') {
        flushText()
        const content = extractContent(line, 'h1')
        if (!titleUsed) {
          result.push({ id: uuid(), type: 'title', content, style: {} })
          titleUsed = true
        } else {
          result.push({ id: uuid(), type: 'heading', content, style: {} })
        }
        continue
      }

      if (kind === 'h2') {
        flushText()
        result.push({ id: uuid(), type: 'heading', content: extractContent(line, 'h2'), style: {} })
        continue
      }

      if (kind === 'quote') {
        flushText()
        result.push({ id: uuid(), type: 'quote', content: extractContent(line, 'quote'), style: {} })
        continue
      }

      textLines.push(line)
    }

    flushList()

    flushText()
  }

  // Fallback: if no title was created, promote the first paragraph
  if (!titleUsed) {
    const first = result.find((b) => b.type === 'paragraph')
    if (first) first.type = 'title'
  }

  return result
}
