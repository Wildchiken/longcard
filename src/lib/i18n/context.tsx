'use client'

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppLocale, AppTheme } from '@/lib/settings'
import { loadUISettings, saveUISettings } from '@/lib/settings'
import { translate } from '@/lib/i18n/dictionary'

interface I18nContextValue {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  resolvedDark: boolean
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const SSR_LOCALE: AppLocale = 'zh'
const SSR_THEME: AppTheme = 'system'

function resolvesDark(theme: AppTheme): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(SSR_LOCALE)
  const [theme, setThemeState] = useState<AppTheme>(SSR_THEME)
  const [resolvedDark, setResolvedDark] = useState(false)

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next)
    saveUISettings({ locale: next })
  }, [])

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next)
    saveUISettings({ theme: next })
  }, [])

  useLayoutEffect(() => {
    const s = loadUISettings()
    setLocaleState(s.locale)
    setThemeState(s.theme)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN'
  }, [locale])

  useLayoutEffect(() => {
    const apply = (dark: boolean) => {
      setResolvedDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    }
    apply(resolvesDark(theme))

    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  )

  const value = useMemo(
    () => ({ locale, setLocale, theme, setTheme, resolvedDark, t }),
    [locale, setLocale, theme, setTheme, resolvedDark, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
