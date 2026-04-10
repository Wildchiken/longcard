import { getFontByFamily } from './registry'

const EXTRA_GOOGLE_SPECS: Record<string, string> = {
  'Noto Serif SC': 'Noto+Serif+SC:wght@400;600;700',
  'Noto Sans SC': 'Noto+Sans+SC:wght@400;500;600;700',
  'Source Han Serif SC': 'Source+Han+Serif+SC:wght@400;600;700',
}

const EXPORT_TEXT_RENDERING_CSS =
  '[data-zs-export-root],[data-zs-export-root] *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:geometricPrecision}'

const GOOGLE_INLINED_CSS_CACHE = new Map<string, string>()

const FONT_EMBED_BUDGET_MS = 50_000

const MAX_UNIQUE_CHARS_FOR_TEXT_PARAM = 480

const FONT_FILE_FETCH_CONCURRENCY = 8

function normalizeFontToken(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, '')
}

export function collectFontFamiliesFromElement(root: HTMLElement): Set<string> {
  const fonts = new Set<string>()
  function addStack(ff: string) {
    ff.split(',').forEach((part) => {
      const n = normalizeFontToken(part)
      if (n) fonts.add(n)
    })
  }
  function walk(el: HTMLElement) {
    addStack(getComputedStyle(el).fontFamily)
    for (const child of el.children) {
      if (child instanceof HTMLElement) walk(child)
    }
  }
  walk(root)
  return fonts
}

function uniqueCharsForGoogleSubset(root: HTMLElement): string | null {
  const seen = new Set<string>()
  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? ''
      for (const ch of t) {
        if (ch === '\n' || ch === '\r' || ch === '\t') seen.add(' ')
        else seen.add(ch)
      }
      return
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      walk(node.childNodes[i]!)
    }
  }
  walk(root)
  if (seen.size > MAX_UNIQUE_CHARS_FOR_TEXT_PARAM) return null
  return [...seen].join('')
}

function googleSpecsForUsedFamilies(used: Set<string>): string[] {
  const specs = new Set<string>()
  for (const fam of used) {
    const curated = getFontByFamily(fam)
    if (curated) {
      specs.add(curated.googleFamily)
      continue
    }
    const extra = EXTRA_GOOGLE_SPECS[fam]
    if (extra) specs.add(extra)
  }
  return [...specs]
}

function buildGoogleFontsCss2Url(specs: string[], textSubset: string | null): string {
  const q = specs.map((s) => `family=${s}`).join('&')
  let url = `https://fonts.googleapis.com/css2?${q}&display=swap`
  if (textSubset != null && textSubset.length > 0) {
    url += `&text=${encodeURIComponent(textSubset)}`
  }
  return url
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function fetchAsDataUrl(absUrl: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(absUrl, { mode: 'cors', credentials: 'omit', signal })
  if (!res.ok) throw new Error(`Font fetch ${res.status}`)
  return blobToDataUrl(await res.blob())
}

async function inlineFontUrlsInCss(
  cssText: string,
  sourceUrl: string,
  signal: AbortSignal,
): Promise<string> {
  const urlRegex = /url\((["']?)([^"')]+)\1\)/g
  const absUrls = new Set<string>()
  for (const m of cssText.matchAll(urlRegex)) {
    let u = m[2].trim()
    if (u.startsWith('data:')) continue
    if (!u.startsWith('http')) {
      try {
        u = new URL(u, sourceUrl).href
      } catch {
        continue
      }
    }
    absUrls.add(u)
  }

  const dataByUrl = new Map<string, string>()
  const urls = [...absUrls]
  for (let i = 0; i < urls.length; i += FONT_FILE_FETCH_CONCURRENCY) {
    const batch = urls.slice(i, i + FONT_FILE_FETCH_CONCURRENCY)
    await Promise.all(
      batch.map(async (u) => {
        try {
          dataByUrl.set(u, await fetchAsDataUrl(u, signal))
        } catch {}
      }),
    )
  }

  return cssText.replace(urlRegex, (full, _q: string, path: string) => {
    let u = path.trim()
    if (u.startsWith('data:')) return full
    if (!u.startsWith('http')) {
      try {
        u = new URL(u, sourceUrl).href
      } catch {
        return full
      }
    }
    const data = dataByUrl.get(u)
    return data ? `url(${data})` : full
  })
}

async function fetchInlinedGoogleFontCss(
  specs: string[],
  signal: AbortSignal,
  textSubset: string | null,
): Promise<string> {
  if (specs.length === 0) return ''
  const href = buildGoogleFontsCss2Url(specs.sort(), textSubset)
  const cached = GOOGLE_INLINED_CSS_CACHE.get(href)
  if (cached !== undefined) return cached

  const res = await fetch(href, {
    mode: 'cors',
    credentials: 'omit',
    headers: { Accept: 'text/css' },
    signal,
  })
  if (!res.ok) throw new Error(`Google Fonts CSS ${res.status}`)
  const raw = await res.text()
  const inlined = await inlineFontUrlsInCss(raw, href, signal)
  if (!signal.aborted) GOOGLE_INLINED_CSS_CACHE.set(href, inlined)
  return inlined
}

function buildCustomFontFaceCss(
  used: Set<string>,
  customFonts: ReadonlyArray<{ name: string; dataUrl: string }>,
): string {
  const parts: string[] = []
  for (const cf of customFonts) {
    if (!used.has(cf.name)) continue
    const escaped = cf.name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    parts.push(
      `@font-face{font-family:"${escaped}";src:url(${cf.dataUrl});font-weight:100 900;font-style:normal;font-display:swap;}`,
    )
  }
  return parts.join('\n')
}

export async function buildFontEmbedCssForCapture(
  root: HTMLElement,
  customFonts: ReadonlyArray<{ name: string; dataUrl: string }>,
  theme: { fontHeading: string; fontBody: string },
): Promise<string> {
  const used = collectFontFamiliesFromElement(root)
  if (theme.fontHeading) used.add(theme.fontHeading)
  if (theme.fontBody) used.add(theme.fontBody)
  const specs = googleSpecsForUsedFamilies(used)
  const customCss = buildCustomFontFaceCss(used, customFonts)
  const tail = [customCss, EXPORT_TEXT_RENDERING_CSS].filter(Boolean).join('\n')

  if (specs.length === 0) return tail

  const textSubset = uniqueCharsForGoogleSubset(root)

  const ac = new AbortController()
  const tid = setTimeout(() => ac.abort(), FONT_EMBED_BUDGET_MS)
  let googleCss = ''
  try {
    googleCss = await fetchInlinedGoogleFontCss(specs, ac.signal, textSubset)
  } catch {
    googleCss = ''
  } finally {
    clearTimeout(tid)
  }

  return [customCss, googleCss, EXPORT_TEXT_RENDERING_CSS].filter(Boolean).join('\n')
}
