'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X, Star } from 'lucide-react'
import { useComposeStore } from '@/store/compose-store'
import { LAYOUT_PRESETS } from '@/lib/page/layout-presets'
import type { LayoutOverrides } from '@/lib/page/layout-presets'
import type { UserTemplate } from '@/lib/db/schema'
import { getPageTheme, type PageTheme } from '@/types/page'
import { useI18n } from '@/lib/i18n/context'

function effectiveThemeFor(themeId: string, overrides: LayoutOverrides = {}): PageTheme {
  const base = getPageTheme(themeId)
  return {
    ...base,
    background:  overrides.backgroundColor ?? base.background,
    text:        overrides.textColor        ?? base.text,
    accent:      overrides.accentColor      ?? base.accent,
    fontHeading: overrides.fontHeading      ?? base.fontHeading,
    fontBody:    overrides.fontBody         ?? base.fontBody,
  }
}

function TemplateCard({
  name,
  theme,
  active,
  isUser,
  onClick,
  onDelete,
  deleteLabel,
}: {
  name: string
  theme: PageTheme
  active: boolean
  isUser?: boolean
  onClick: () => void
  onDelete?: () => void
  deleteLabel?: string
}) {

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full flex flex-col rounded-xl overflow-hidden transition-all duration-150 text-left focus:outline-none ${
          active
            ? 'ring-2 ring-[#B58A3A] shadow-md dark:ring-amber-500'
            : 'ring-1 ring-black/8 dark:ring-white/10 hover:ring-[#B58A3A]/50 dark:hover:ring-amber-500/50 hover:shadow-sm'
        }`}
      >
        {/* Color preview */}
        <div
          style={{ backgroundColor: theme.background, height: 44, padding: '8px 10px 6px' }}
        >
          <div
            style={{
              fontFamily: theme.fontHeading,
              fontSize: 9,
              fontWeight: 700,
              color: theme.text,
              lineHeight: 1.2,
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </div>
          {[85, 100, 70].map((w, i) => (
            <div
              key={i}
              style={{
                height: 2.5,
                borderRadius: 2,
                backgroundColor: `${theme.textMuted}40`,
                marginBottom: 2.5,
                width: `${w}%`,
              }}
            />
          ))}
        </div>

        {/* Label */}
        <div
          style={{
            backgroundColor: theme.surface,
            padding: '3px 6px 4px',
            fontFamily: theme.fontBody,
            fontSize: 10,
            fontWeight: active ? 700 : 500,
            color: theme.text,
            textAlign: 'center',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isUser ? (
            <span className="flex items-center justify-center gap-1">
              <Star size={8} className="flex-shrink-0" style={{ color: '#B58A3A' }} />
              {name}
            </span>
          ) : name}
        </div>
      </button>

      {/* Delete button for user templates */}
      {isUser && onDelete && deleteLabel && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 hover:border-red-300 dark:hover:border-red-500 transition-colors opacity-0 group-hover:opacity-100 shadow-sm z-10"
          style={{ width: 18, height: 18 }}
          aria-label={deleteLabel}
        >
          <X size={10} />
        </button>
      )}
    </div>
  )
}

export function TemplateSelector() {
  const { t } = useI18n()
  const { presetId, setPresetId, overrides, userTemplates, loadUserTemplate, deleteUserTemplate, loadUserTemplates } = useComposeStore()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    void loadUserTemplates()
  }, [loadUserTemplates])

  const activePreset = LAYOUT_PRESETS.find((p) => p.id === presetId) ?? LAYOUT_PRESETS[0]
  const hasOverrides = Object.keys(overrides).length > 0

  const activeUserTemplate = userTemplates.find((t) => {
    return t.presetId === presetId &&
      JSON.stringify(t.overrides) === JSON.stringify(overrides)
  })

  const activeLabel = activeUserTemplate?.name ?? activePreset.name
  const activeSwatchColor = (overrides as LayoutOverrides).backgroundColor
    ?? getPageTheme(activePreset.themeId).background

  return (
    <div className="select-none">
      {/* Collapsed trigger */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-colors ${
          expanded ? 'border-[#B58A3A] bg-[#FAF7F2] dark:border-amber-600/60 dark:bg-gray-800/80' : 'border-[#E7E1D4] dark:border-gray-700 hover:border-[#C9BFAE] dark:hover:border-gray-600 hover:bg-[#FAF7F2] dark:hover:bg-gray-800/60'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Mini color swatch */}
          <div
            className="w-4 h-4 rounded flex-shrink-0 ring-1 ring-black/8 dark:ring-white/15"
            style={{ backgroundColor: activeSwatchColor }}
          />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{activeLabel}</span>
          {hasOverrides && !activeUserTemplate && (
            <span className="text-[9px] font-medium text-[#B58A3A] dark:text-amber-400 bg-[#FDF3E0] dark:bg-amber-950/50 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {t('template.customized')}
            </span>
          )}
        </div>
        <ChevronDown
          size={13}
          className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded grid */}
      {expanded && (
        <div className="mt-2 space-y-3">
          {/* User templates section */}
          {userTemplates.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#B58A3A] dark:text-amber-400 uppercase tracking-wider mb-1.5 px-0.5">
                {t('template.myTemplates')}
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {userTemplates.map((tmpl: UserTemplate) => {
                  const baseThemeId = LAYOUT_PRESETS.find((p) => p.id === tmpl.presetId)?.themeId ?? 'page-clean'
                  const isActive = tmpl.presetId === presetId &&
                    JSON.stringify(tmpl.overrides) === JSON.stringify(overrides)
                  return (
                    <TemplateCard
                      key={tmpl.id}
                      name={tmpl.name}
                      theme={effectiveThemeFor(baseThemeId, tmpl.overrides)}
                      active={isActive}
                      isUser
                      onClick={() => { loadUserTemplate(tmpl); setExpanded(false) }}
                      onDelete={() => void deleteUserTemplate(tmpl.id)}
                      deleteLabel={`${t('template.myTemplates')} ${tmpl.name}`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          <div>
            {userTemplates.length > 0 && (
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1.5 px-0.5">
                {t('template.builtIn')}
              </p>
            )}
            <div className="grid grid-cols-4 gap-1.5">
              {LAYOUT_PRESETS.map((preset) => (
                <TemplateCard
                  key={preset.id}
                  name={preset.name}
                  theme={effectiveThemeFor(preset.themeId)}
                  active={presetId === preset.id && !activeUserTemplate}
                  onClick={() => { setPresetId(preset.id); setExpanded(false) }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
