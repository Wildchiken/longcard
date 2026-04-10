'use client'

import { useEffect, useState } from 'react'
import { Clock, RotateCcw, Trash2, AlertCircle } from 'lucide-react'
import { listPageVersions, deletePageVersion } from '@/lib/db/queries'
import type { PageVersion } from '@/lib/db/schema'
import { useComposeStore } from '@/store/compose-store'
import { parseTextToBlocks } from '@/lib/page/autolayout'
import { getPreset } from '@/lib/page/layout-presets'
import type { LayoutOverrides } from '@/lib/page/layout-presets'
import { useI18n } from '@/lib/i18n/context'

interface VersionHistoryPanelProps {
  pageId: string
}

export function VersionHistoryPanel({ pageId }: VersionHistoryPanelProps) {
  const { t } = useI18n()
  const [versions, setVersions] = useState<PageVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pageId) return
    setLoading(true)
    setError(null)
    listPageVersions(pageId)
      .then(setVersions)
      .catch(() => setError(t('history.loadError')))
      .finally(() => setLoading(false))
  }, [pageId, t])

  const handleRestore = async (v: PageVersion) => {
    setRestoring(v.id)
    setError(null)
    try {
      const page = v.snapshot
      const restoredMd = page.markdownEnabled !== undefined ? page.markdownEnabled : true
      const restoredOverrides = (page.layoutOverrides ?? {}) as LayoutOverrides
      const restoredPresetId = page.layoutPresetId ?? getPreset('editorial').id
      useComposeStore.getState().commitHistory()
      useComposeStore.setState({
        pageTitle: page.title,
        sourceText: page.sourceText ?? '',
        blocks: page.sourceText
          ? parseTextToBlocks(page.sourceText, { markdownEnabled: restoredMd })
          : page.blocks,
        imageBlocks: page.imageBlocks ?? [],
        presetId: restoredPresetId,
        overrides: restoredOverrides,
        markdownEnabled: restoredMd,
        savedAt: page.updatedAt,
      })
      useComposeStore.getState().commitHistory()
    } catch {
      setError(t('history.restoreError'))
    } finally {
      setRestoring(null)
    }
  }

  const handleDelete = async (v: PageVersion) => {
    setError(null)
    try {
      await deletePageVersion(v.id)
      setVersions((prev) => prev.filter((x) => x.id !== v.id))
    } catch {
      setError(t('history.deleteError'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-gray-400 dark:text-gray-500">
        {t('history.loading')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/35 rounded-xl px-3 py-2.5">
          <AlertCircle size={12} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {versions.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Clock size={24} className="text-gray-200 dark:text-gray-700" />
          <p className="text-xs text-gray-400 dark:text-gray-500">{t('history.empty')}</p>
          <p className="text-xs text-gray-300 dark:text-gray-600">{t('history.emptyHint')}</p>
        </div>
      )}

      {versions.map((v) => (
        <div key={v.id} className="rounded-xl border border-[#E7E1D4] dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{v.title || t('history.untitled')}</p>
            {v.note && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{v.note}</p>
            )}
            <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
              {new Date(v.createdAt).toLocaleString(t('lang.zh') === '中文' ? 'zh-CN' : 'en-US')}
            </p>
          </div>
          <div className="flex border-t border-[#F0EBE3] dark:border-gray-800 divide-x divide-[#F0EBE3] dark:divide-gray-800">
            <button
              onClick={() => void handleRestore(v)}
              disabled={restoring === v.id}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] text-[#B58A3A] dark:text-amber-400 hover:bg-[#FAF7F2] dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={11} />
              {restoring === v.id ? t('history.restoring') : t('history.restore')}
            </button>
            <button
              onClick={() => void handleDelete(v)}
              className="px-3 py-2 text-[11px] text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
