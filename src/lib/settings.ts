const KEY = 'zs_ui_settings'

export type AppLocale = 'zh' | 'en'
export type AppTheme = 'light' | 'dark' | 'system'

export interface UISettings {
  exportScale: 2 | 3
  watermarkText: string
  locale: AppLocale
  theme: AppTheme
}

const DEFAULTS: UISettings = {
  exportScale: 3,
  watermarkText: '',
  locale: 'zh',
  theme: 'system',
}

export function loadUISettings(): UISettings {
  if (typeof window === 'undefined') return { ...DEFAULTS }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<UISettings>
    return {
      exportScale: parsed.exportScale === 2 ? 2 : 3,
      watermarkText: typeof parsed.watermarkText === 'string' ? parsed.watermarkText : '',
      locale: parsed.locale === 'en' ? 'en' : 'zh',
      theme: (['light', 'dark', 'system'] as AppTheme[]).includes(parsed.theme as AppTheme)
        ? (parsed.theme as AppTheme)
        : 'system',
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveUISettings(settings: Partial<UISettings>) {
  if (typeof window === 'undefined') return
  try {
    const current = loadUISettings()
    localStorage.setItem(KEY, JSON.stringify({ ...current, ...settings }))
  } catch { /* ignore quota errors */ }
}
