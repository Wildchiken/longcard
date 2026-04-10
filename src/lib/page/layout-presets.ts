export interface LayoutPreset {
  id: string
  name: string
  description: string
  /** Paired PageTheme id */
  themeId: string
  /** Container max-width in logical px */
  contentWidth: number
  /** Horizontal padding */
  paddingX: number
  /** Vertical padding (top/bottom) */
  paddingY: number
  /** Gap between blocks (rem equivalent in px) */
  blockGap: number
  /** Extra gap after title block */
  titleGap: number
  /** Title font size */
  titleFontSize: number
  /** Heading font size */
  headingFontSize: number
  /** Body font size */
  bodyFontSize: number
  /** Quote font size */
  quoteFontSize: number
  /** Base line height */
  lineHeight: number
  /** 'left' | 'center' */
  titleAlign: 'left' | 'center'
  /** Whether to show a decorative rule below the title */
  titleRule: boolean
  /** Quote block visual style */
  quoteStyle: 'left-bar' | 'centered' | 'plain'
  /** Divider style */
  dividerStyle: 'line' | 'dots' | 'asterisks'
  /** Whether paragraph first-line is indented */
  paragraphIndent: boolean
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'editorial',
    name: '纸白',
    description: '纯白底、高对比易读，留白宽裕，接近系统浅色阅读的舒适感',
    themeId: 'page-paper',
    contentWidth: 700,
    paddingX: 64,
    paddingY: 92,
    blockGap: 24,
    titleGap: 48,
    titleFontSize: 40,
    headingFontSize: 24,
    bodyFontSize: 16,
    quoteFontSize: 17,
    lineHeight: 1.8,
    titleAlign: 'center',
    titleRule: false,
    quoteStyle: 'left-bar',
    dividerStyle: 'line',
    paragraphIndent: false,
  },
  {
    id: 'academia',
    name: '暗夜学院',
    description: '深色复古，知性典雅，学术氛围',
    themeId: 'page-dark-academia',
    contentWidth: 720,
    paddingX: 52,
    paddingY: 64,
    blockGap: 22,
    titleGap: 44,
    titleFontSize: 40,
    headingFontSize: 26,
    bodyFontSize: 17,
    quoteFontSize: 19,
    lineHeight: 1.85,
    titleAlign: 'center',
    titleRule: false,
    quoteStyle: 'centered',
    dividerStyle: 'asterisks',
    paragraphIndent: true,
  },
  {
    id: 'journal',
    name: '手账笔记',
    description: '暖调纸质感，左对齐，手写温度',
    themeId: 'page-journal',
    contentWidth: 700,
    paddingX: 48,
    paddingY: 60,
    blockGap: 18,
    titleGap: 36,
    titleFontSize: 34,
    headingFontSize: 22,
    bodyFontSize: 16,
    quoteFontSize: 17,
    lineHeight: 2.0,
    titleAlign: 'left',
    titleRule: false,
    quoteStyle: 'left-bar',
    dividerStyle: 'line',
    paragraphIndent: false,
  },
  {
    id: 'minimal',
    name: '极简灰',
    description: '去掉一切装饰，只剩文字与空间',
    themeId: 'page-minimal-gray',
    contentWidth: 680,
    paddingX: 44,
    paddingY: 56,
    blockGap: 16,
    titleGap: 32,
    titleFontSize: 36,
    headingFontSize: 22,
    bodyFontSize: 15,
    quoteFontSize: 16,
    lineHeight: 1.75,
    titleAlign: 'left',
    titleRule: false,
    quoteStyle: 'plain',
    dividerStyle: 'line',
    paragraphIndent: false,
  },
  {
    id: 'coffee',
    name: '素雅',
    description: '温润纸白，衬线标题，空间充裕，适合各类内容',
    themeId: 'page-clean',
    contentWidth: 700,
    paddingX: 64,
    paddingY: 88,
    blockGap: 26,
    titleGap: 52,
    titleFontSize: 42,
    headingFontSize: 26,
    bodyFontSize: 16,
    quoteFontSize: 18,
    lineHeight: 2.0,
    titleAlign: 'center',
    titleRule: false,
    quoteStyle: 'left-bar',
    dividerStyle: 'line',
    paragraphIndent: false,
  },
  {
    id: 'matcha',
    name: '抹茶清新',
    description: '绿意盎然，清爽简洁，自然系排版',
    themeId: 'page-matcha',
    contentWidth: 700,
    paddingX: 48,
    paddingY: 60,
    blockGap: 18,
    titleGap: 36,
    titleFontSize: 34,
    headingFontSize: 22,
    bodyFontSize: 16,
    quoteFontSize: 17,
    lineHeight: 1.85,
    titleAlign: 'left',
    titleRule: false,
    quoteStyle: 'left-bar',
    dividerStyle: 'line',
    paragraphIndent: false,
  },
  {
    id: 'lavender',
    name: '薰衣紫',
    description: '梦幻紫调，优雅浪漫，适合情感表达',
    themeId: 'page-lavender',
    contentWidth: 720,
    paddingX: 52,
    paddingY: 68,
    blockGap: 22,
    titleGap: 44,
    titleFontSize: 40,
    headingFontSize: 26,
    bodyFontSize: 17,
    quoteFontSize: 19,
    lineHeight: 2.0,
    titleAlign: 'center',
    titleRule: false,
    quoteStyle: 'centered',
    dividerStyle: 'dots',
    paragraphIndent: false,
  },
  {
    id: 'midnight',
    name: '午夜蓝',
    description: '深邃暗夜，科技感，现代都市风',
    themeId: 'page-midnight',
    contentWidth: 760,
    paddingX: 56,
    paddingY: 64,
    blockGap: 20,
    titleGap: 40,
    titleFontSize: 44,
    headingFontSize: 28,
    bodyFontSize: 16,
    quoteFontSize: 18,
    lineHeight: 1.8,
    titleAlign: 'left',
    titleRule: false,
    quoteStyle: 'left-bar',
    dividerStyle: 'line',
    paragraphIndent: false,
  },
]

export function getPreset(id: string): LayoutPreset {
  return LAYOUT_PRESETS.find((p) => p.id === id) ?? LAYOUT_PRESETS[0]
}

/**
 * Per-user direct overrides. Every field is an exact absolute value —
 * no abstract "small/medium/large" levels. undefined = use preset default.
 */
export interface LayoutOverrides {
  // ── Layout dimensions ──────────────────────────────────────────────────
  contentWidth?: number       // px, e.g. 680
  paddingX?: number           // px
  paddingY?: number           // px
  blockGap?: number           // px between blocks
  titleGap?: number           // px after title

  // ── Typography ─────────────────────────────────────────────────────────
  titleFontSize?: number      // px
  headingFontSize?: number    // px
  bodyFontSize?: number       // px
  quoteFontSize?: number      // px
  lineHeight?: number         // unitless ratio, e.g. 1.8

  // ── Alignment & decoration ─────────────────────────────────────────────
  titleAlign?: 'left' | 'center'
  titleRule?: boolean
  quoteStyle?: 'left-bar' | 'centered' | 'plain'
  dividerStyle?: 'line' | 'dots' | 'asterisks'
  paragraphIndent?: boolean

  // ── Colors (hex strings) ───────────────────────────────────────────────
  backgroundColor?: string
  textColor?: string
  accentColor?: string

  // ── Fonts (family names) ───────────────────────────────────────────────
  fontHeading?: string
  fontBody?: string
}

/** Apply overrides on top of a preset — exact values win, undefined falls back to preset */
export function applyOverrides(preset: LayoutPreset, overrides: LayoutOverrides): LayoutPreset {
  return {
    ...preset,
    contentWidth:    overrides.contentWidth    ?? preset.contentWidth,
    paddingX:        overrides.paddingX        ?? preset.paddingX,
    paddingY:        overrides.paddingY        ?? preset.paddingY,
    blockGap:        overrides.blockGap        ?? preset.blockGap,
    titleGap:        overrides.titleGap        ?? preset.titleGap,
    titleFontSize:   overrides.titleFontSize   ?? preset.titleFontSize,
    headingFontSize: overrides.headingFontSize ?? preset.headingFontSize,
    bodyFontSize:    overrides.bodyFontSize    ?? preset.bodyFontSize,
    quoteFontSize:   overrides.quoteFontSize   ?? preset.quoteFontSize,
    lineHeight:      overrides.lineHeight      ?? preset.lineHeight,
    titleAlign:      overrides.titleAlign      ?? preset.titleAlign,
    titleRule:       overrides.titleRule       ?? preset.titleRule,
    quoteStyle:      overrides.quoteStyle      ?? preset.quoteStyle,
    dividerStyle:    overrides.dividerStyle    ?? preset.dividerStyle,
    paragraphIndent: overrides.paragraphIndent ?? preset.paragraphIndent,
  }
}
