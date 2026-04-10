import type { Block } from '@/types/page'
import type { LayoutPreset } from '@/lib/page/layout-presets'

export type PreflightSeverity = 'error' | 'warn' | 'info'

export interface PreflightResult {
  id: string
  severity: PreflightSeverity
  params?: Record<string, string | number>
}

export interface PreflightInput {
  blocks: Block[]
  preset: LayoutPreset
  bgColor: string
  textColor: string
  exportFormat: 'image' | 'pdf' | 'html'
}

/** 估算正文字符量（含列表项） */
export function totalTextChars(blocks: Block[]): number {
  return blocks.reduce((s, b) => {
    if (b.listItems?.length) return s + b.listItems.join('\n').length
    return s + b.content.length
  }, 0)
}


function hexToRgb(hex: string): [number, number, number] | null {
  let clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('')
  }
  if (clean.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(clean)) return null
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0.5
  const [r, g, b] = rgb.map((c) => {
    const n = c / 255
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function runPreflight(input: PreflightInput): PreflightResult[] {
  const results: PreflightResult[] = []
  const { blocks, preset, bgColor, textColor, exportFormat } = input

  const hasContent = blocks.some((b) => {
    if (b.type === 'image' && b.imageUrl) return true
    if (b.listItems?.some((item) => item.trim().length > 0)) return true
    return b.content.trim().length > 0
  })
  if (!hasContent) {
    results.push({
      id: 'empty-content',
      severity: 'error',
    })
  }

  const cr = contrastRatio(textColor, bgColor)
  if (cr < 3.0) {
    results.push({
      id: 'low-contrast',
      severity: 'error',
      params: { ratio: cr.toFixed(1) },
    })
  } else if (cr < 4.5) {
    results.push({
      id: 'contrast-warn',
      severity: 'warn',
      params: { ratio: cr.toFixed(1) },
    })
  }

  if (preset.bodyFontSize < 12) {
    results.push({
      id: 'font-too-small',
      severity: 'warn',
      params: { size: preset.bodyFontSize },
    })
  }

  if (preset.titleFontSize > 88) {
    results.push({
      id: 'title-too-large',
      severity: 'warn',
      params: { size: preset.titleFontSize },
    })
  }

  const hasTitle = blocks.some((b) => b.type === 'title')
  if (!hasTitle && hasContent) {
    results.push({
      id: 'no-title',
      severity: 'info',
    })
  }

  const totalChars = totalTextChars(blocks)

  if (exportFormat === 'image' && totalChars >= 1200 && totalChars <= 4000) {
    results.push({
      id: 'social-share-tip',
      severity: 'info',
    })
  }

  if (exportFormat === 'image' && totalChars > 4000) {
    results.push({
      id: 'long-image',
      severity: 'warn',
      params: { chars: totalChars },
    })
  }

  if (exportFormat === 'pdf' && totalChars > 6000) {
    results.push({
      id: 'long-pdf',
      severity: 'info',
    })
  }

  if (preset.paddingX * 2 >= preset.contentWidth * 0.5) {
    results.push({
      id: 'padding-too-large',
      severity: 'info',
    })
  }

  return results
}

export function hasErrors(results: PreflightResult[]): boolean {
  return results.some((r) => r.severity === 'error')
}
