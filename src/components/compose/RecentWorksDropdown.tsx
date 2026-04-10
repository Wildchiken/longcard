'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Clock, ChevronDown, Library } from 'lucide-react'
import { getAllPages, deletePage } from '@/lib/db/queries'
import type { ZinePage } from '@/types/page'
import { useI18n } from '@/lib/i18n/context'
import { useToast } from '@/lib/toast-context'

interface RecentWorksDropdownProps {
  currentPageId: string
  onSelectPage: (id: string) => void
  onNewPage: () => void
}

export function RecentWorksDropdown({ currentPageId, onSelectPage, onNewPage }: RecentWorksDropdownProps) {
  const { locale, t } = useI18n()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<ZinePage[]>([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const load = async () => {
    setLoading(true)
    try {
      const all = await getAllPages()
      setPages(all.slice(0, 20))
    } catch {
      setPages([])
      showToast({ variant: 'error', message: t('toast.recentListFailed') })
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setOpen((v) => {
      if (!v) void load()
      return !v
    })
  }

  const handleSelect = (id: string) => {
    setOpen(false)
    onSelectPage(id)
  }

  const handleDelete = async (e: React.MouseEvent, page: ZinePage) => {
    e.stopPropagation()
    const title = page.title || t('recent.untitled')
    if (!confirm(t('recent.deleteConfirm', { title }))) return
    try {
      await deletePage(page.id)
      setPages((prev) => prev.filter((p) => p.id !== page.id))
    } catch {
      showToast({ variant: 'error', message: t('toast.deleteFailed') })
    }
  }

  const handleNew = () => {
    setOpen(false)
    onNewPage()
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', {
      month: 'numeric',
      day: 'numeric',
    })

  return (
    <div ref={panelRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t('recent.myWorks')}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors ${
          open ? 'bg-[#F6F2EA] dark:bg-gray-800' : 'hover:bg-[#F6F2EA] dark:hover:bg-gray-800'
        }`}
      >
        <div className="w-7 h-7 bg-[#171717] dark:bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Library size={15} className="text-white dark:text-gray-900" strokeWidth={2.25} aria-hidden />
        </div>
        <ChevronDown
          size={11}
          className={`text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-gray-950 rounded-2xl shadow-xl ring-1 ring-black/8 dark:ring-white/10 z-50 overflow-hidden">
          <div className="p-2 border-b border-[#F0EBE3] dark:border-gray-800">
            <button
              type="button"
              onClick={handleNew}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#171717] text-white dark:bg-gray-100 dark:text-gray-900 text-xs font-semibold hover:bg-[#2A2A2A] dark:hover:bg-gray-200 transition-colors"
            >
              <Plus size={13} />
              {t('recent.newZine')}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8 text-xs text-gray-400 dark:text-gray-500">
                {t('recent.loading')}
              </div>
            )}

            {!loading && pages.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
                <Clock size={20} className="text-gray-200 dark:text-gray-700" />
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('recent.empty')}</p>
                <p className="text-xs text-gray-300 dark:text-gray-600">{t('recent.emptyHint')}</p>
              </div>
            )}

            {!loading && pages.length > 0 && (
              <div className="p-2 space-y-0.5">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 pt-1 pb-1.5">
                  {t('recent.section')}
                </p>
                {pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleSelect(page.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group ${
                      page.id === currentPageId
                        ? 'bg-[#FAF7F2] ring-1 ring-[#E7E1D4] dark:bg-gray-800 dark:ring-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/80'
                    }`}
                  >
                    <div className="w-9 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 ring-1 ring-black/6 dark:ring-white/10">
                      {page.thumbnailDataURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={page.thumbnailDataURL}
                          alt={page.title}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-base text-gray-300 dark:text-gray-600">{t('recent.thumbChar')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {page.title || t('recent.untitled')}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {formatDate(page.updatedAt)}
                        {page.id === currentPageId && (
                          <span className="ml-1.5 text-[#B58A3A] dark:text-amber-400">{t('recent.current')}</span>
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => void handleDelete(e, page)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      aria-label={`${t('recent.deleteAria')} ${page.title || t('recent.untitled')}`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!loading && pages.length > 0 && (
            <div className="p-2 border-t border-[#F0EBE3] dark:border-gray-800">
              <Link
                href="/gallery"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl py-2.5 text-xs font-semibold text-[#8B6914] dark:text-amber-400 hover:bg-[#FAF7F2] dark:hover:bg-gray-800 transition-colors touch-manipulation"
              >
                {t('recent.viewAll')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
