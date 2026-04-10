'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGalleryStore } from '@/store/gallery-store'
import type { Zine } from '@/types/zine'
import { MoreHorizontal, Edit2, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ZineCardProps {
  zine: Zine
}

export function ZineCard({ zine }: ZineCardProps) {
  const { removeZine, upsertZine } = useGalleryStore()
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    if (confirm(`删除「${zine.title}」？此操作不可撤销。`)) {
      await removeZine(zine.id)
    }
    setOpen(false)
  }

  const handleDuplicate = async () => {
    const { v4: uuid } = await import('uuid')
    const copy: Zine = {
      ...zine,
      id: uuid(),
      title: `${zine.title} (副本)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await upsertZine(copy)
    setOpen(false)
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="group relative">
      <Link href={`/editor?id=${encodeURIComponent(zine.id)}`} className="block">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          {zine.thumbnailDataURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={zine.thumbnailDataURL}
              alt={zine.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
              <span className="text-4xl text-gray-300 dark:text-gray-600">Z</span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2 px-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{zine.title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(zine.updatedAt)}</p>
      </div>

      {/* Actions */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="absolute top-2 right-2 h-7 w-7 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg inline-flex items-center justify-center"
        >
          <MoreHorizontal size={14} />
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1 dark:border-gray-700 dark:bg-gray-950" align="end">
          <Link href={`/editor?id=${encodeURIComponent(zine.id)}`}>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left dark:text-gray-200">
              <Edit2 size={14} /> 编辑
            </button>
          </Link>
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left dark:text-gray-200"
          >
            <Copy size={14} /> 复制
          </button>
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
