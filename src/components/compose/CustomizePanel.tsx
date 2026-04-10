'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, BookmarkPlus, Star, TabletSmartphone } from 'lucide-react'
import { useComposeStore } from '@/store/compose-store'
import type { LayoutOverrides } from '@/lib/page/layout-presets'
import { computeDeviceAdaptiveOverrides, readViewportWidth } from '@/lib/page/device-adaptive'
import { addCustomFont, removeCustomFont } from '@/lib/fonts/custom-fonts'
import { detectSystemFonts, CATEGORY_LABELS } from '@/lib/fonts/system-fonts'
import type { SystemFontEntry } from '@/lib/fonts/system-fonts'

type FontTarget = 'both' | 'heading' | 'body'

// ─────────────────────────────────────────────────────────────────────────────
// Primitive widgets
// ─────────────────────────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  decimals?: number
  onChange: (v: number) => void
}

function SliderRow({ label, value, min, max, step, unit = '', decimals = 0, onChange }: SliderRowProps) {
  const display = decimals > 0 ? value.toFixed(decimals) : String(value)
  const inc = () => onChange(Math.min(max, parseFloat((value + step).toFixed(10))))
  const dec = () => onChange(Math.max(min, parseFloat((value - step).toFixed(10))))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={dec}
            className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm leading-none hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 flex items-center justify-center select-none"
          >−</button>
          <span className="text-xs font-mono text-gray-800 dark:text-gray-200 w-12 text-center tabular-nums">
            {display}{unit}
          </span>
          <button
            onClick={inc}
            className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm leading-none hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 flex items-center justify-center select-none"
          >+</button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer accent-gray-800 dark:accent-gray-300"
      />
    </div>
  )
}

interface OptionButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function OptionButton({ active, onClick, children }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

function ToggleRow({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <button
        onClick={onToggle}
        className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${active ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'left-[18px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}

interface ColorRowProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function ColorRow({ label, value, onChange }: ColorRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{value.toUpperCase()}</span>
        <label className="relative cursor-pointer">
          <div
            className="w-7 h-7 rounded-lg border-2 border-white dark:border-gray-700 shadow shadow-black/10 dark:shadow-black/40"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
      </div>
    </div>
  )
}

// ── Built-in font options (always available) ─────────────────────────────────
const BUILTIN_FONTS = [
  { label: 'PingFang SC（苹方）', value: 'PingFang SC' },
  { label: 'Microsoft YaHei（微软雅黑）', value: 'Microsoft YaHei' },
  { label: 'Noto Serif SC（思源宋体）', value: 'Noto Serif SC' },
  { label: 'Noto Sans SC（思源黑体）', value: 'Noto Sans SC' },
  { label: 'Source Han Serif SC（思源宋）', value: 'Source Han Serif SC' },
  { label: 'Playfair Display（优雅衬线）', value: 'Playfair Display' },
  { label: 'EB Garamond（复古衬线）', value: 'EB Garamond' },
  { label: 'Lora（温润衬线）', value: 'Lora' },
  { label: 'Josefin Sans（几何无衬线）', value: 'Josefin Sans' },
  { label: 'DM Sans（现代无衬线）', value: 'DM Sans' },
  { label: 'Inter（中性无衬线）', value: 'Inter' },
]

// Google Fonts to load at runtime (only web fonts that aren't typically on-device)
const GOOGLE_FONTS_TO_LOAD = [
  'Playfair+Display:wght@400;700',
  'EB+Garamond:wght@400;700',
  'Lora:wght@400;700',
  'Josefin+Sans:wght@400;600',
  'DM+Sans:wght@400;500',
  'Inter:wght@400;500',
  'Noto+Serif+SC:wght@400;700',
  'Noto+Sans+SC:wght@400;500',
]

// ── System font picker ────────────────────────────────────────────────────────

interface FontPickerProps {
  label: string
  value: string
  systemFonts: SystemFontEntry[]
  systemFontsLoading: boolean
  customFontNames: string[]
  onChange: (v: string) => void
}

function FontPicker({ label, value, systemFonts, systemFontsLoading, customFontNames, onChange }: FontPickerProps) {
  const [previewFamily, setPreviewFamily] = useState(value)

  // Keep preview in sync when value changes externally (preset switch, override reset, etc.)
  useEffect(() => { setPreviewFamily(value) }, [value])

  const grouped = new Map<string, SystemFontEntry[]>()
  for (const f of systemFonts) {
    const key = CATEGORY_LABELS[f.category]
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(f)
  }

  const handleChange = (family: string) => {
    onChange(family)
    // Trigger async font load so preview updates immediately
    if (typeof document !== 'undefined') {
      document.fonts.load(`16px "${family}"`).then(() => setPreviewFamily(family)).catch(() => setPreviewFamily(family))
    } else {
      setPreviewFamily(family)
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:border-gray-400 dark:focus:border-gray-500 text-gray-800 dark:text-gray-200"
        style={{ fontFamily: value }}
      >
        <optgroup label="— 内置/网络字体 —">
          {BUILTIN_FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </optgroup>

        {customFontNames.length > 0 && (
          <optgroup label="— 已上传字体 —">
            {customFontNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </optgroup>
        )}

        {systemFontsLoading && <optgroup label="— 正在检测系统字体… —" />}
        {!systemFontsLoading && systemFonts.length === 0 && <optgroup label="— 未检测到其他系统字体 —" />}
        {!systemFontsLoading && Array.from(grouped.entries()).map(([cat, fonts]) => (
          <optgroup key={cat} label={`— ${cat} —`}>
            {fonts.map((f) => (
              <option key={f.family} value={f.family}>{f.label}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {previewFamily && (
        <p
          className="text-sm text-gray-600 dark:text-gray-400 truncate px-1"
          style={{ fontFamily: `"${previewFamily}", sans-serif` }}
        >
          AaBbCc 你好世界 1234
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section accordion
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide">{title}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && <div className="pb-4 space-y-3.5">{children}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Save-as-template inline form
// ─────────────────────────────────────────────────────────────────────────────

function SaveAsTemplateRow({ onSave }: { onSave: (name: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpen = () => {
    setEditing(true)
    setName('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleConfirm = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(name.trim())
      setSaved(true)
      setTimeout(() => { setSaved(false); setEditing(false) }, 1200)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <BookmarkPlus size={12} />
        另存为模版
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') void handleConfirm(); if (e.key === 'Escape') setEditing(false) }}
        placeholder="输入模版名称…"
        maxLength={20}
        className="flex-1 text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
      />
      <button
        onClick={() => void handleConfirm()}
        disabled={saving || !name.trim()}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 disabled:opacity-40 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
      >
        {saved ? <Check size={12} /> : saving ? '…' : <Check size={12} />}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
      >
        取消
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main panel
// ─────────────────────────────────────────────────────────────────────────────

export function CustomizePanel() {
  const [systemFonts, setSystemFonts] = useState<SystemFontEntry[]>([])
  const [systemFontsLoading, setSystemFontsLoading] = useState(false)
  const [setAsDefaultDone, setSetAsDefaultDone] = useState(false)

  // Load system fonts
  useEffect(() => {
    setSystemFontsLoading(true)
    detectSystemFonts()
      .then((r) => setSystemFonts(r.available))
      .finally(() => setSystemFontsLoading(false))
  }, [])

  // Inject Google Fonts link at runtime (avoids build-time import issues)
  useEffect(() => {
    if (typeof document === 'undefined') return
    const id = 'zs-google-fonts'
    if (document.getElementById(id)) return
    const families = GOOGLE_FONTS_TO_LOAD.join('&family=')
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`
    document.head.appendChild(link)
  }, [])

  const {
    presetId,
    effectivePreset, effectiveTheme,
    overrides, setOverrides, resetOverrides,
    markdownEnabled, setMarkdownEnabled,
    exportFormat, setExportFormat,
    customFonts, setCustomFonts,
    watermarkText, setWatermarkText,
    exportScale, setExportScale,
    saveAsTemplate,
    setDefaultOverrides, clearDefaultOverrides,
  } = useComposeStore()

  const p = effectivePreset()
  const t = effectiveTheme()
  const o = overrides as LayoutOverrides

  const hasOverrides = Object.keys(o).length > 0

  const [fontError, setFontError] = useState<string | null>(null)
  const [fontUploading, setFontUploading] = useState(false)

  const handleFontUpload = async (file: File | null) => {
    if (!file) return
    setFontError(null)
    setFontUploading(true)
    try {
      const next = await addCustomFont(file)
      const latest = useComposeStore.getState().customFonts
      setCustomFonts([next, ...latest.filter((f) => f.id !== next.id)])
    } catch (err) {
      setFontError(err instanceof Error ? err.message : '字体上传失败')
    } finally {
      setFontUploading(false)
    }
  }

  const handleRemoveFont = async (id: string) => {
    await removeCustomFont(id)
    const latest = useComposeStore.getState().customFonts
    setCustomFonts(latest.filter((f) => f.id !== id))
  }

  const applyFont = (fontName: string, target: FontTarget) => {
    if (target === 'both') setOverrides({ fontHeading: fontName, fontBody: fontName })
    else if (target === 'heading') setOverrides({ fontHeading: fontName })
    else setOverrides({ fontBody: fontName })
  }

  const handleSetAsDefault = () => {
    setDefaultOverrides(presetId, overrides)
    setSetAsDefaultDone(true)
    setTimeout(() => setSetAsDefaultDone(false), 2000)
  }

  const handleDeviceAdaptive = () => {
    setOverrides(computeDeviceAdaptiveOverrides(readViewportWidth()))
  }

  return (
    <div className="space-y-0">

      {/* ── 顶部操作行：重置 / 已自定义提示 ──────────────── */}
      <div className="flex items-center justify-between py-2 mb-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {hasOverrides ? '已有自定义调整' : '当前为模版默认样式'}
        </span>
        <button
          onClick={resetOverrides}
          className={`text-xs transition-colors ${
            hasOverrides ? 'text-red-400 hover:text-red-600 dark:hover:text-red-400' : 'text-gray-300 dark:text-gray-600 cursor-default'
          }`}
          disabled={!hasOverrides}
        >
          恢复默认
        </button>
      </div>

      {/* ── 完整参数 ──────────────────────────────────────────── */}
      <>
        <Section title="字号与间距">
            <SliderRow label="标题字号" value={p.titleFontSize} min={16} max={96} step={1} unit="px"
              onChange={(v) => setOverrides({ titleFontSize: v })} />
            <SliderRow label="小标题字号" value={p.headingFontSize} min={12} max={56} step={1} unit="px"
              onChange={(v) => setOverrides({ headingFontSize: v })} />
            <SliderRow label="正文字号" value={p.bodyFontSize} min={11} max={30} step={1} unit="px"
              onChange={(v) => setOverrides({ bodyFontSize: v })} />
            <SliderRow label="行间距" value={p.lineHeight} min={1.1} max={3.2} step={0.05} decimals={2}
              onChange={(v) => setOverrides({ lineHeight: v })} />
            <SliderRow label="段落间距" value={p.blockGap} min={4} max={96} step={2} unit="px"
              onChange={(v) => setOverrides({ blockGap: v })} />
          </Section>

          <Section title="页面布局">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 px-3 py-2.5 space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed flex-1 min-w-0">
                  按当前浏览器窗口宽度估算<strong className="font-medium text-gray-800 dark:text-gray-200">内容宽度</strong>与<strong className="font-medium text-gray-800 dark:text-gray-200">留白</strong>。适合「在本机全屏看长图」的比例；旋转屏幕或改窗口后可再点一次。不改动字号与配色。
                </p>
                <button
                  type="button"
                  onClick={handleDeviceAdaptive}
                  className="flex items-center justify-center gap-1.5 shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                  <TabletSmartphone size={14} />
                  按当前屏幕适配
                </button>
              </div>
            </div>
            <SliderRow label="内容宽度" value={p.contentWidth} min={280} max={1200} step={10} unit="px"
              onChange={(v) => setOverrides({ contentWidth: v })} />
            <SliderRow label="左右留白" value={p.paddingX} min={8} max={140} step={4} unit="px"
              onChange={(v) => setOverrides({ paddingX: v })} />
            <SliderRow label="上下留白" value={p.paddingY} min={12} max={200} step={4} unit="px"
              onChange={(v) => setOverrides({ paddingY: v })} />
            <SliderRow label="标题后间距" value={p.titleGap} min={8} max={140} step={4} unit="px"
              onChange={(v) => setOverrides({ titleGap: v })} />
          </Section>

          <Section title="配色" defaultOpen={false}>
            <ColorRow label="背景色" value={t.background}
              onChange={(v) => setOverrides({ backgroundColor: v })} />
            <ColorRow label="正文颜色" value={t.text}
              onChange={(v) => setOverrides({ textColor: v })} />
            <ColorRow label="强调色" value={t.accent}
              onChange={(v) => setOverrides({ accentColor: v })} />
          </Section>

          <Section title="字体" defaultOpen={false}>
            <FontPicker
              label="标题字体"
              value={t.fontHeading}
              systemFonts={systemFonts}
              systemFontsLoading={systemFontsLoading}
              customFontNames={customFonts.map((f) => f.name)}
              onChange={(v) => setOverrides({ fontHeading: v })}
            />
            <FontPicker
              label="正文字体"
              value={t.fontBody}
              systemFonts={systemFonts}
              systemFontsLoading={systemFontsLoading}
              customFontNames={customFonts.map((f) => f.name)}
              onChange={(v) => setOverrides({ fontBody: v })}
            />
          </Section>

          <Section title="排版细节">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-500 block mb-2">标题对齐</span>
              <div className="flex gap-2">
                <OptionButton active={p.titleAlign === 'center'} onClick={() => setOverrides({ titleAlign: 'center' })}>居中</OptionButton>
                <OptionButton active={p.titleAlign === 'left'} onClick={() => setOverrides({ titleAlign: 'left' })}>左对齐</OptionButton>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-500 block mb-2">引用样式</span>
              <div className="flex gap-2">
                <OptionButton active={p.quoteStyle === 'left-bar'} onClick={() => setOverrides({ quoteStyle: 'left-bar' })}>侧边线</OptionButton>
                <OptionButton active={p.quoteStyle === 'centered'} onClick={() => setOverrides({ quoteStyle: 'centered' })}>居中块</OptionButton>
                <OptionButton active={p.quoteStyle === 'plain'} onClick={() => setOverrides({ quoteStyle: 'plain' })}>纯文字</OptionButton>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-500 block mb-2">分割线样式</span>
              <div className="flex gap-2">
                <OptionButton active={p.dividerStyle === 'line'} onClick={() => setOverrides({ dividerStyle: 'line' })}>细线</OptionButton>
                <OptionButton active={p.dividerStyle === 'dots'} onClick={() => setOverrides({ dividerStyle: 'dots' })}>圆点</OptionButton>
                <OptionButton active={p.dividerStyle === 'asterisks'} onClick={() => setOverrides({ dividerStyle: 'asterisks' })}>星号</OptionButton>
              </div>
            </div>
            <ToggleRow
              label="标题装饰线"
              active={p.titleRule}
              onToggle={() => setOverrides({ titleRule: !p.titleRule })}
            />
            <ToggleRow
              label="段落首行缩进"
              active={p.paragraphIndent}
              onToggle={() => setOverrides({ paragraphIndent: !p.paragraphIndent })}
            />
          </Section>

          {/* ── 保存模版 ──────────────────────────────────────── */}
          <Section title="保存为模版">
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              将当前所有样式调整保存为可复用的模版，下次直接在风格选择器中选用。
            </p>
            <SaveAsTemplateRow onSave={saveAsTemplate} />
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSetAsDefault}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  setAsDefaultDone ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {setAsDefaultDone ? <Check size={12} /> : <Star size={12} />}
                {setAsDefaultDone ? '已设为默认' : '设为此模版的默认样式'}
              </button>
              {hasOverrides && (
                <button
                  onClick={() => clearDefaultOverrides(presetId)}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  清除默认
                </button>
              )}
            </div>
          </Section>

          {/* ── Markdown 与字体 ─────────────────────────────── */}
          <Section title="Markdown 与字体" defaultOpen={false}>
            <ToggleRow
              label="启用 Markdown 语法解析"
              active={markdownEnabled}
              onToggle={() => setMarkdownEnabled(!markdownEnabled)}
            />

            <div className="space-y-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">上传自定义字体</span>
              <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                fontUploading ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-900'
              }`}>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {fontUploading ? '上传中…' : '点击选择 .ttf / .otf / .woff / .woff2'}
                </span>
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={(e) => void handleFontUpload(e.target.files?.[0] ?? null)}
                  className="sr-only"
                  disabled={fontUploading}
                />
              </label>
              {fontError && <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">{fontError}</p>}
              <p className="text-xs text-gray-400 dark:text-gray-500">单文件最大 12 MB，最多存 20 个；字体文件存储在浏览器中，删除源文件后仍可使用</p>
            </div>

            {customFonts.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">已导入字体（{customFonts.length}）</span>
                <div className="space-y-2">
                  {customFonts.map((f) => (
                    <div key={f.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                      <div
                        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 truncate"
                        style={{ fontFamily: `"${f.name}", sans-serif` }}
                      >
                        {f.name}  AaBbCc 你好世界
                      </div>
                      <div className="flex divide-x divide-gray-100 dark:divide-gray-800">
                        <button onClick={() => applyFont(f.name, 'both')} className="flex-1 py-1.5 text-[11px] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">全部应用</button>
                        <button onClick={() => applyFont(f.name, 'heading')} className="flex-1 py-1.5 text-[11px] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">标题</button>
                        <button onClick={() => applyFont(f.name, 'body')} className="flex-1 py-1.5 text-[11px] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">正文</button>
                        <button onClick={() => void handleRemoveFont(f.id)} className="px-3 py-1.5 text-[11px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </>

      {/* ── 署名与导出 ───────────────────────────────────────── */}
      <Section title="署名与导出">
        <div className="space-y-1.5">
          <span className="text-xs text-gray-600 dark:text-gray-400">底部署名 / 水印</span>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="例：@你的名字  留空不显示"
            maxLength={30}
            className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-gray-400 dark:focus:border-gray-500 text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs text-gray-600 dark:text-gray-400">导出分辨率</span>
          <div className="flex gap-2">
            <OptionButton active={exportScale === 2} onClick={() => setExportScale(2)}>标准 @2×</OptionButton>
            <OptionButton active={exportScale === 3} onClick={() => setExportScale(3)}>高清 @3×</OptionButton>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {exportScale === 3 ? '推荐，适合手机/朋友圈分享' : '文件更小，适合网络分享'}
          </p>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs text-gray-600 dark:text-gray-400">默认导出格式</span>
          <div className="flex gap-2 flex-wrap">
            <OptionButton active={exportFormat === 'png'} onClick={() => setExportFormat('png')}>PNG</OptionButton>
            <OptionButton active={exportFormat === 'jpeg'} onClick={() => setExportFormat('jpeg')}>JPEG</OptionButton>
            <OptionButton active={exportFormat === 'webp'} onClick={() => setExportFormat('webp')}>WebP</OptionButton>
            <OptionButton active={exportFormat === 'svg'} onClick={() => setExportFormat('svg')}>SVG</OptionButton>
            <OptionButton active={exportFormat === 'clipboard'} onClick={() => setExportFormat('clipboard')}>复制图片</OptionButton>
            <OptionButton active={exportFormat === 'pdf'} onClick={() => setExportFormat('pdf')}>PDF</OptionButton>
            <OptionButton active={exportFormat === 'html'} onClick={() => setExportFormat('html')}>HTML</OptionButton>
            <OptionButton active={exportFormat === 'markdown'} onClick={() => setExportFormat('markdown')}>Markdown</OptionButton>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">可在导出对话框中临时切换</p>
        </div>
      </Section>

    </div>
  )
}
