'use client'

// ── Curated fallback list ─────────────────────────────────────────────────────
// Grouped by category; used when queryLocalFonts() is unavailable.

export interface SystemFontEntry {
  family: string
  label: string
  category: 'zh-sans' | 'zh-serif' | 'zh-handwriting' | 'en-serif' | 'en-sans' | 'en-mono'
}

const KNOWN_FONTS: SystemFontEntry[] = [
  // ── Chinese sans-serif ──
  { family: 'PingFang SC',       label: '苹方（PingFang SC）',       category: 'zh-sans' },
  { family: 'PingFang TC',       label: '苹方繁（PingFang TC）',     category: 'zh-sans' },
  { family: 'Microsoft YaHei',   label: '微软雅黑',                   category: 'zh-sans' },
  { family: 'Microsoft JhengHei',label: '微软正黑体',                 category: 'zh-sans' },
  { family: 'Hiragino Sans GB',  label: 'Hiragino Sans GB',          category: 'zh-sans' },
  { family: 'Noto Sans SC',      label: 'Noto Sans SC',              category: 'zh-sans' },
  { family: 'Source Han Sans SC',label: '思源黑体',                   category: 'zh-sans' },
  { family: 'WenQuanYi Micro Hei',label: '文泉驿微米黑',             category: 'zh-sans' },
  { family: 'Heiti SC',          label: '黑体-简',                   category: 'zh-sans' },
  { family: 'Heiti TC',          label: '黑体-繁',                   category: 'zh-sans' },

  // ── Chinese serif ──
  { family: 'Songti SC',         label: '宋体-简（Songti SC）',      category: 'zh-serif' },
  { family: 'Songti TC',         label: '宋体-繁（Songti TC）',      category: 'zh-serif' },
  { family: 'STSong',            label: '华文宋体（STSong）',         category: 'zh-serif' },
  { family: 'SimSun',            label: '中易宋体（SimSun）',         category: 'zh-serif' },
  { family: 'FangSong',          label: '仿宋',                      category: 'zh-serif' },
  { family: 'STFangsong',        label: '华文仿宋',                  category: 'zh-serif' },
  { family: 'Noto Serif SC',     label: 'Noto Serif SC',            category: 'zh-serif' },
  { family: 'Source Han Serif SC',label: '思源宋体',                 category: 'zh-serif' },

  // ── Chinese handwriting ──
  { family: 'KaiTi',             label: '楷体',                      category: 'zh-handwriting' },
  { family: 'STKaiti',           label: '华文楷体（STKaiti）',        category: 'zh-handwriting' },
  { family: 'Kaiti SC',          label: '楷体-简（Kaiti SC）',        category: 'zh-handwriting' },
  { family: 'LiSu',             label: '隶书',                      category: 'zh-handwriting' },
  { family: 'STXingkai',         label: '华文行楷',                  category: 'zh-handwriting' },

  // ── English serif ──
  { family: 'Georgia',           label: 'Georgia',                  category: 'en-serif' },
  { family: 'Times New Roman',   label: 'Times New Roman',          category: 'en-serif' },
  { family: 'Palatino',          label: 'Palatino',                 category: 'en-serif' },
  { family: 'Garamond',          label: 'Garamond',                 category: 'en-serif' },
  { family: 'Book Antiqua',      label: 'Book Antiqua',             category: 'en-serif' },
  { family: 'Baskerville',       label: 'Baskerville',              category: 'en-serif' },
  { family: 'Didot',             label: 'Didot',                    category: 'en-serif' },
  { family: 'Hoefler Text',      label: 'Hoefler Text',             category: 'en-serif' },

  // ── English sans-serif ──
  { family: 'Arial',             label: 'Arial',                    category: 'en-sans' },
  { family: 'Helvetica',         label: 'Helvetica',                category: 'en-sans' },
  { family: 'Helvetica Neue',    label: 'Helvetica Neue',           category: 'en-sans' },
  { family: 'Verdana',           label: 'Verdana',                  category: 'en-sans' },
  { family: 'Trebuchet MS',      label: 'Trebuchet MS',             category: 'en-sans' },
  { family: 'Tahoma',            label: 'Tahoma',                   category: 'en-sans' },
  { family: 'Calibri',           label: 'Calibri',                  category: 'en-sans' },
  { family: 'Segoe UI',          label: 'Segoe UI',                 category: 'en-sans' },
  { family: 'Gill Sans',         label: 'Gill Sans',                category: 'en-sans' },
  { family: 'Optima',            label: 'Optima',                   category: 'en-sans' },
  { family: 'Futura',            label: 'Futura',                   category: 'en-sans' },

  // ── Mono ──
  { family: 'Courier New',       label: 'Courier New',              category: 'en-mono' },
  { family: 'Menlo',             label: 'Menlo',                    category: 'en-mono' },
  { family: 'Monaco',            label: 'Monaco',                   category: 'en-mono' },
  { family: 'Consolas',          label: 'Consolas',                 category: 'en-mono' },
]

export const CATEGORY_LABELS: Record<SystemFontEntry['category'], string> = {
  'zh-sans':        '中文无衬线',
  'zh-serif':       '中文衬线',
  'zh-handwriting': '中文手写/艺术',
  'en-serif':       '英文衬线',
  'en-sans':        '英文无衬线',
  'en-mono':        '等宽',
}

// ── Detection helpers ────────────────────────────────────────────────────────

/**
 * Check a single font via CSS Font Loading API.
 * Returns true if the font renders differently from the fallback.
 */
async function isFontAvailable(family: string): Promise<boolean> {
  if (typeof document === 'undefined') return false
  // CSS Font Loading API — fast path
  if ('fonts' in document) {
    try {
      // Use a Unicode range that covers both Chinese and Latin to be safer
      const testString = 'abcdefghijABCDEFGHIJ你好'
      return document.fonts.check(`12px "${family}"`, testString)
    } catch {
      // fall through to canvas method
    }
  }
  // Canvas fallback (slow but reliable in older browsers)
  return canvasFontCheck(family)
}

function canvasFontCheck(family: string): boolean {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 40
    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    const text = '你好Hello'
    const getPixels = (font: string) => {
      ctx.clearRect(0, 0, 200, 40)
      ctx.font = `16px ${font}, monospace`
      ctx.fillText(text, 0, 20)
      return ctx.getImageData(0, 0, 200, 40).data.join()
    }

    const baseline = getPixels('monospace')
    const test = getPixels(`"${family}"`)
    return baseline !== test
  } catch {
    return false
  }
}

// ── Main API ─────────────────────────────────────────────────────────────────

export interface DetectedFonts {
  /** Fonts confirmed available on this device */
  available: SystemFontEntry[]
  /** Whether queryLocalFonts() was used (vs. probe-list fallback) */
  usedLocalFontsApi: boolean
}

declare global {
  interface Window {
    queryLocalFonts?: () => Promise<Array<{ family: string; fullName: string; style: string; postscriptName: string }>>
  }
}

/**
 * Detect usable fonts on the current device.
 * Tries queryLocalFonts() first (Chrome 103+), falls back to probing the curated list.
 */
export async function detectSystemFonts(): Promise<DetectedFonts> {
  if (typeof window === 'undefined') return { available: [], usedLocalFontsApi: false }

  // ── Path A: Local Font Access API ──
  if (typeof window.queryLocalFonts === 'function') {
    try {
      const raw = await window.queryLocalFonts()
      const familySet = new Set(raw.map((f) => f.family.toLowerCase()))
      const available = KNOWN_FONTS.filter((f) => familySet.has(f.family.toLowerCase()))

      // Also collect unique families from the full list that aren't in KNOWN_FONTS
      // (so the user can see fonts we didn't pre-curate)
      const knownFamilies = new Set(KNOWN_FONTS.map((f) => f.family.toLowerCase()))
      const extra = raw
        .filter((f) => !knownFamilies.has(f.family.toLowerCase()))
        .map((f): SystemFontEntry => ({
          family: f.family,
          label: f.family,
          category: guessCategory(f.family),
        }))
        // Deduplicate by family
        .filter((f, i, arr) => arr.findIndex((x) => x.family === f.family) === i)
        .slice(0, 200) // cap at 200 extra fonts

      return { available: [...available, ...extra], usedLocalFontsApi: true }
    } catch {
      // User denied permission or API error — fall through
    }
  }

  // ── Path B: Probe curated list ──
  const results = await Promise.all(
    KNOWN_FONTS.map(async (f) => ({ font: f, ok: await isFontAvailable(f.family) }))
  )
  const available = results.filter((r) => r.ok).map((r) => r.font)
  return { available, usedLocalFontsApi: false }
}

function guessCategory(family: string): SystemFontEntry['category'] {
  const lower = family.toLowerCase()
  if (/[\u4e00-\u9fff]/.test(family)) return 'zh-sans'
  if (/song|ming|serif|roman|garamond|times|georgia|baskerville/i.test(lower)) return 'en-serif'
  if (/mono|courier|console|menlo|code/i.test(lower)) return 'en-mono'
  return 'en-sans'
}
