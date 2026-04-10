'use client'

import { useEffect, useState } from 'react'
import { X, Settings2, History } from 'lucide-react'
import { CustomizePanel } from './CustomizePanel'
import { VersionHistoryPanel } from './VersionHistoryPanel'
import { useComposeStore } from '@/store/compose-store'

interface StyleDrawerProps {
  open: boolean
  onClose: () => void
}

export function StyleDrawer({ open, onClose }: StyleDrawerProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'history'>('style')
  const { pageId } = useComposeStore()

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sm:hidden fixed inset-0 z-40 bg-black/15 dark:bg-black/40 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`sm:hidden fixed left-0 right-0 bottom-0 z-50 h-[min(78dvh,680px)] max-h-[90dvh] bg-white dark:bg-gray-950 shadow-2xl rounded-t-2xl ring-1 ring-black/5 dark:ring-white/10
          flex flex-col transition-transform duration-200 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-label="调整面板"
        aria-hidden={!open}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto mt-2 mb-1" />

        {/* Header */}
        <div className="px-5 pt-3 pb-0 border-b border-[#E7E1D4] dark:border-gray-800 flex-shrink-0">
          {/* Tab row */}
          <div className="flex items-center justify-between mb-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab('style')}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'style'
                    ? 'border-[#171717] dark:border-gray-200 text-[#171717] dark:text-gray-100'
                    : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                }`}
              >
                <Settings2 size={12} />
                样式调整
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-[#171717] dark:border-gray-200 text-[#171717] dark:text-gray-100'
                    : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                }`}
              >
                <History size={12} />
                历史版本
              </button>
            </div>
            <button
              onClick={onClose}
              aria-label="关闭面板"
              className="w-8 h-8 mb-1 flex items-center justify-center rounded-lg hover:bg-[#F6F2EA] dark:hover:bg-gray-800 text-[#7C7467] dark:text-gray-500 transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>

        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 bg-gray-50/40 dark:bg-gray-900/50">
          {activeTab === 'style' ? (
            <CustomizePanel />
          ) : (
            <VersionHistoryPanel pageId={pageId} />
          )}
        </div>

        {/* Footer CTA — only for style tab */}
        {activeTab === 'style' && (
          <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#E7E1D4] dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-950">
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] py-3 bg-[#171717] text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-semibold rounded-xl hover:bg-[#2A2A2A] dark:hover:bg-gray-200 active:bg-[#2A2A2A] dark:active:bg-gray-200 transition-colors duration-200 touch-manipulation"
            >
              完成调整
            </button>
          </div>
        )}
      </div>
    </>
  )
}
