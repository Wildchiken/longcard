'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGalleryStore } from '@/store/gallery-store'
import type { ZinePage } from '@/types/page'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useI18n } from '@/lib/i18n/context'

interface PageCardProps {
  page: ZinePage
}

export function PageCard({ page }: PageCardProps) {
  const { t, locale } = useI18n()
  const { removePage } = useGalleryStore()
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    if (confirm(`删除「${page.title}」？此操作不可撤销。`)) {
      await removePage(page.id)
    }
    setOpen(false)
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="group relative">
      <Link href={`/compose?id=${page.id}`} className="block">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          {page.thumbnailDataURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.thumbnailDataURL}
              alt={page.title}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <span className="text-3xl text-gray-300 dark:text-gray-600">文</span>
            </div>
          )}
          {/* Long image badge */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white text-[10px] font-medium">
            {t('gallery.badgeLong')}
          </div>
        </div>
      </Link>

      <div className="mt-2 px-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{page.title || '未命名'}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(page.updatedAt)}</p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="absolute top-2 right-2 h-7 w-7 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg inline-flex items-center justify-center">
          <MoreHorizontal size={14} />
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1 dark:border-gray-700 dark:bg-gray-950" align="end">
          <Link href={`/compose?id=${page.id}`}>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left dark:text-gray-200">
              <Pencil size={14} /> 重新编辑
            </button>
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-left"
          >
            <Trash2 size={14} /> 删除
          </button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
