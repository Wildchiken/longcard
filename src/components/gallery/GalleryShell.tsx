'use client'

import Link from 'next/link'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { useI18n } from '@/lib/i18n/context'

export function GalleryShell() {
  const { t, setTheme, resolvedDark } = useI18n()

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-gray-100/80 dark:from-gray-950 dark:to-gray-950">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200/90 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/compose"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation min-h-[44px]"
        >
          <ArrowLeft size={16} className="text-gray-500 dark:text-gray-500" />
          {t('gallery.back')}
        </Link>
        <h1 className="flex-1 text-base font-semibold text-gray-900 dark:text-gray-100">{t('gallery.title')}</h1>
        <button
          type="button"
          onClick={() => setTheme(resolvedDark ? 'light' : 'dark')}
          title={resolvedDark ? t('theme.light') : t('theme.dark')}
          aria-label={resolvedDark ? t('theme.light') : t('theme.dark')}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/90 dark:border-gray-700 touch-manipulation"
        >
          {resolvedDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>
      <main className="pb-[max(1rem,env(safe-area-inset-bottom))]">
        <GalleryGrid />
      </main>
    </div>
  )
}
