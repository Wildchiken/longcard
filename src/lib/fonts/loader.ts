import { CURATED_FONTS } from './registry'

const loadedFonts = new Set<string>()

export async function loadFont(family: string): Promise<void> {
  if (loadedFonts.has(family)) return

  const fontDef = CURATED_FONTS.find((f) => f.family === family)
  if (!fontDef) return

  const href = `https://fonts.googleapis.com/css2?family=${fontDef.googleFamily}&display=swap`
  const existing = document.querySelector(`link[href="${href}"]`)

  if (!existing) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }

  try {
    await document.fonts.ready
    loadedFonts.add(family)
  } catch {
    // non-fatal
  }
}

export async function loadMultipleFonts(families: string[]): Promise<void> {
  const unique = [...new Set(families)]
  await Promise.all(unique.map(loadFont))
}

export function preloadDefaultFonts(): void {
  const defaults = ['Inter', 'Plus Jakarta Sans', 'Playfair Display', 'DM Sans', 'Caveat', 'Lora']
  defaults.forEach((f) => loadFont(f))
}
