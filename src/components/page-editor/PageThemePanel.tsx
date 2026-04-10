'use client'

import { PAGE_THEMES } from '@/types/page'
import { usePageStore } from '@/store/page-store'
import { Check } from 'lucide-react'

export function PageThemePanel() {
  const { themeId, setThemeId } = usePageStore()

  return (
    <div className="p-3 overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        {PAGE_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setThemeId(t.id)}
            className={`rounded-xl border-2 overflow-hidden transition-all text-left ${
              themeId === t.id ? 'border-gray-900 shadow-md' : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="px-3 pt-3 pb-2" style={{ backgroundColor: t.background }}>
              <p className="font-bold text-sm mb-0.5" style={{ color: t.text, fontFamily: t.fontHeading }}>
                标题文字
              </p>
              <p className="text-xs leading-relaxed" style={{ color: t.textMuted, fontFamily: t.fontBody }}>
                正文内容预览...
              </p>
              <div className="flex gap-1 mt-2">
                {[t.accent, t.text, t.textMuted].map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="px-2 py-1.5" style={{ backgroundColor: t.surface }}>
              <p className="text-[11px] font-medium truncate" style={{ color: t.text }}>
                {t.id.replace('page-', '').replace(/-/g, ' ')}
              </p>
              {themeId === t.id && (
                <Check size={10} className="inline ml-1" style={{ color: t.accent }} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
