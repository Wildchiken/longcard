import { CURATED_FONTS } from './registry'

const loadedFonts = new Set<string>()
const loadingFonts = new Map<string, Promise<void>>()

function cssFontFamilyToken(family: string): string {
  if (!family.includes(' ') && /^[a-zA-Z0-9-]+$/.test(family)) return family
  return `"${family.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

async function _loadFont(family: string): Promise<void> {
  const fontDef = CURATED_FONTS.find((f) => f.family === family)
  if (!fontDef) return

  const href = `https://fonts.googleapis.com/css2?family=${fontDef.googleFamily}&display=swap`
  const existing = document.querySelector(`link[href="${href}"]`)

  if (!existing) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    const linkDone = new Promise<void>((resolve) => {
      link.onload = () => resolve()
      link.onerror = () => resolve()
    })
    document.head.appendChild(link)
    await linkDone
  }

  try {
    await document.fonts.ready
    const q = cssFontFamilyToken(family)
    await Promise.all([
      document.fonts.load(`400 16px ${q}`).catch(() => []),
      document.fonts.load(`700 32px ${q}`).catch(() => []),
    ])
    loadedFonts.add(family)
  } catch {}
}

export function loadFont(family: string): Promise<void> {
  if (loadedFonts.has(family)) return Promise.resolve()
  const inflight = loadingFonts.get(family)
  if (inflight) return inflight
  const p = _loadFont(family).finally(() => loadingFonts.delete(family))
  loadingFonts.set(family, p)
  return p
}

export async function loadMultipleFonts(families: string[]): Promise<void> {
  const unique = [...new Set(families)]
  await Promise.all(unique.map(loadFont))
}

export async function ensureFontsReadyForCapture(
  fontHeading: string,
  fontBody: string,
): Promise<void> {
  await loadMultipleFonts([fontHeading, fontBody])
  await document.fonts.ready
  const families = [...new Set([fontHeading, fontBody].filter(Boolean))]
  const weights = [
    '300 15px',
    '400 16px',
    '500 18px',
    '600 16px',
    '600 22px',
    '700 28px',
    '700 40px',
    '900 52px',
  ]
  await Promise.all(
    families.flatMap((fam) => {
      const q = cssFontFamilyToken(fam)
      return weights.map((w) => document.fonts.load(`${w} ${q}`).catch(() => []))
    }),
  )
  await document.fonts.ready
}

export function preloadDefaultFonts(): void {
  const defaults = ['Inter', 'Plus Jakarta Sans', 'Playfair Display', 'DM Sans', 'Caveat', 'Lora']
  defaults.forEach((f) => loadFont(f))
}
