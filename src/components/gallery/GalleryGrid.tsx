'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useGalleryStore } from '@/store/gallery-store'
import { PageCard } from './PageCard'
import { ZineCard } from './ZineCard'
import { Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { useToast } from '@/lib/toast-context'

export function GalleryGrid() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const { pages, zines, isLoading, loadAll } = useGalleryStore()

  useEffect(() => {
    void (async () => {
      try {
        await loadAll()
      } catch {
        showToast({ variant: 'error', message: t('toast.galleryLoadFailed') })
      }
    })()
  }, [loadAll, showToast, t])

  const hasContent = pages.length > 0 || zines.length > 0

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6">
          <BookOpen size={32} className="text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('gallery.emptyTitle')}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-sm">{t('gallery.emptyHint')}</p>
        <Link href="/compose">
          <Button className="gap-2 rounded-xl h-11 px-6">
            <Plus size={18} />
            {t('gallery.startCreate')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {pages.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 mb-4 uppercase tracking-wide">
            {t('gallery.longPages')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        </section>
      )}

      {zines.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 mb-4 uppercase tracking-wide">
            {t('gallery.canvasWorks')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {zines.map((zine) => (
              <ZineCard key={zine.id} zine={zine} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
