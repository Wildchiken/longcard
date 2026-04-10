'use client'

import { useRef, useState, useCallback, useEffect, type CSSProperties } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useComposeStore } from '@/store/compose-store'
import { TextInputArea } from './TextInputArea'
import { TemplateSelector } from './TemplateSelector'
import { LongImagePreview } from './LongImagePreview'
import { StyleDrawer } from './StyleDrawer'
import { CustomizePanel } from './CustomizePanel'
import { ExportDialog } from './ExportDialog'
import { VersionHistoryPanel } from './VersionHistoryPanel'
import { RecentWorksDropdown } from './RecentWorksDropdown'
import {
  Download, Share2, BookmarkPlus, Pencil, Eye,
  Settings2, Loader2, Check, ArrowRight, RotateCcw, X,
  Undo2, Redo2, History, Maximize2, Languages, LayoutGrid, Sun, Moon,
} from 'lucide-react'
import type { Block, PageTheme } from '@/types/page'
import type { LayoutPreset } from '@/lib/page/layout-presets'
import { loadAllCustomFonts } from '@/lib/fonts/custom-fonts'
import { ensureFontsReadyForCapture } from '@/lib/fonts/loader'
import { loadUISettings, saveUISettings } from '@/lib/settings'
import { useI18n } from '@/lib/i18n/context'
import { useToast } from '@/lib/toast-context'
import { escapeHtml } from '@/lib/utils'

type MobileTab = 'write' | 'preview'

function mergeBlocks(
  textBlocks: Block[],
  imageBlocks: Array<Block & { insertAfterIndex: number }>,
): Block[] {
  if (imageBlocks.length === 0) return textBlocks
  const n = textBlocks.length
  const byIndex = new Map<number, Block[]>()
  for (const img of imageBlocks) {
    const key = Math.min(img.insertAfterIndex, n)
    const bucket = byIndex.get(key)
    if (bucket) bucket.push(img)
    else byIndex.set(key, [img])
  }
  const result: Block[] = []
  for (let i = 0; i < n; i++) {
    result.push(textBlocks[i])
    const imgs = byIndex.get(i)
    if (imgs) result.push(...imgs)
  }
  const trailing = byIndex.get(n)
  if (trailing) result.push(...trailing)
  return result
}

const LOCAL_HINT_KEY = 'zs_local_data_hint_dismissed_v1'

function sanitizeFilenameBase(raw: string, fallback: string): string {
  const t = raw.trim().slice(0, 80) || fallback
  const s = t.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_')
  return s || fallback
}

function LocalDataHintBanner({ onExportBackup }: { onExportBackup: () => void }) {
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(LOCAL_HINT_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(LOCAL_HINT_KEY, '1')
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  if (dismissed === null || dismissed) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-50/90 border-b border-amber-100/80 text-xs text-amber-950 flex-shrink-0 z-20 dark:bg-amber-900/25 dark:border-amber-800/40 dark:text-amber-200">
      <p className="flex-1 leading-relaxed">
        <span className="font-semibold text-amber-900 dark:text-amber-200">{t('localHint.bold')}</span>
        {t('localHint.body')}
      </p>
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onExportBackup}
          className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-900 font-medium hover:bg-amber-100/50 touch-manipulation dark:bg-transparent dark:border-amber-700/60 dark:text-amber-300 dark:hover:bg-amber-800/30"
        >
          {t('localHint.exportBackup')}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="px-3 py-1.5 rounded-lg text-amber-800/80 hover:bg-amber-100/60 touch-manipulation dark:text-amber-400/80 dark:hover:bg-amber-800/30"
        >
          {t('localHint.dismiss')}
        </button>
      </div>
    </div>
  )
}

// ─── Scaled preview wrapper ─────────────────────────────────────────────────

function ScaledPreviewContainer({
  contentWidth,
  children,
}: {
  contentWidth: number
  children: React.ReactNode
}) {
  return (
    <div className="w-full overflow-x-auto overscroll-x-contain">
      <div
        className="flex justify-center py-6 sm:py-8 md:py-10 px-3 sm:px-6 box-border mx-auto"
        style={{ width: `max(100%, ${contentWidth}px)` }}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-xl shadow-black/8 ring-1 ring-black/6 dark:shadow-black/40 dark:ring-white/10 flex-shrink-0"
          style={{ width: contentWidth }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Fullscreen preview (read-only copy; export still uses main previewRef) ──

interface FullscreenPreviewLayerProps {
  open: boolean
  onClose: () => void
  contentWidth: number
  blocks: Block[]
  theme: PageTheme
  preset: LayoutPreset
  watermarkText?: string
  markdownEnabled: boolean
}

function FullscreenPreviewLayer({
  open,
  onClose,
  contentWidth,
  blocks,
  theme,
  preset,
  watermarkText,
  markdownEnabled,
}: FullscreenPreviewLayerProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#0c0c0c]/97"
      role="dialog"
      aria-modal="true"
      aria-label={t('fullscreen.dialogAria')}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 border-b border-white/10 flex-shrink-0 pt-[max(0.5rem,env(safe-area-inset-top))] bg-black/50">
        <p className="text-sm font-medium text-white/90 truncate pl-1">
          {t('fullscreen.title')}
          <span className="text-white/45 font-normal text-xs ml-2 hidden sm:inline">{t('fullscreen.esc')}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white/90 hover:bg-white/10 active:bg-white/15 touch-manipulation"
          aria-label={t('fullscreen.closeAria')}
        >
          <X size={22} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto overscroll-x-contain">
        <div
          className="flex justify-center py-6 px-3 sm:px-6 pb-[max(2rem,env(safe-area-inset-bottom))] box-border mx-auto"
          style={{ width: `max(100%, ${contentWidth}px)` }}
        >
          <div
            className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/15 flex-shrink-0"
            style={{ width: contentWidth }}
          >
            <LongImagePreview
              blocks={blocks}
              theme={theme}
              preset={preset}
              watermarkText={watermarkText}
              markdownEnabled={markdownEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main workbench ──────────────────────────────────────────────────────────

export function ComposeWorkbench() {
  const { t, locale, setLocale, setTheme, resolvedDark } = useI18n()
  const { showToast } = useToast()
  const router = useRouter()
  const {
    pageId,
    pageTitle, setPageTitle, blocks, imageBlocks, removeImageBlock,
    effectivePreset, effectiveTheme,
    saveToGallery, isSaving, loadPage,
    watermarkText, setWatermarkText, exportScale, setExportScale, resetPage, sourceText,
    exportFormat, setCustomFonts,
    markdownEnabled,
    undo, redo, canUndo, canRedo,
  } = useComposeStore()

  const searchParams = useSearchParams()
  const pageIdParam = searchParams.get('id')
  const allowSettingsPersist = useRef(false)
  const pendingLoadRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pageIdParam) {
      pendingLoadRef.current = null
      return
    }
    const id = pageIdParam
    pendingLoadRef.current = id
    void (async () => {
      const result = await loadPage(id)
      if (pendingLoadRef.current !== id) return
      if (result === false) {
        showToast({ variant: 'error', message: t('toast.loadFailed') })
      }
    })()
  }, [pageIdParam, loadPage, showToast, t])

  useEffect(() => {
    void loadAllCustomFonts().then(setCustomFonts)
  }, [setCustomFonts])

  useEffect(() => {
    const s = loadUISettings()
    if (s.watermarkText) setWatermarkText(s.watermarkText)
    if (s.exportScale !== 3) setExportScale(s.exportScale)
    queueMicrotask(() => { allowSettingsPersist.current = true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!allowSettingsPersist.current) return
    saveUISettings({ watermarkText })
  }, [watermarkText])

  useEffect(() => {
    if (!allowSettingsPersist.current) return
    saveUISettings({ exportScale })
  }, [exportScale])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const previewRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [showStyle, setShowStyle] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('write')
  const [actionDone, setActionDone] = useState<'export' | 'save' | null>(null)
  const [sidePanel, setSidePanel] = useState<'style' | 'history'>('style')
  const [fullscreenPreviewOpen, setFullscreenPreviewOpen] = useState(false)

  const preset = effectivePreset()
  const theme = effectiveTheme()
  const isEmpty = blocks.length === 0 && imageBlocks.length === 0

  useEffect(() => {
    if (isEmpty) setFullscreenPreviewOpen(false)
  }, [isEmpty])

  const openFullscreenPreview = useCallback(() => {
    setShowStyle(false)
    setFullscreenPreviewOpen(true)
  }, [])

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (flashTimerRef.current) clearTimeout(flashTimerRef.current) }, [])
  const flashDone = useCallback((kind: 'export' | 'save') => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    setActionDone(kind)
    flashTimerRef.current = setTimeout(() => { setActionDone(null); flashTimerRef.current = null }, 2500)
  }, [])

  const captureImage = useCallback(async (): Promise<string | null> => {
    if (!previewRef.current) return null
    await ensureFontsReadyForCapture(theme.fontHeading, theme.fontBody)
    const { toPng } = await import('html-to-image')
    const exportFilter = (node: Node) =>
      !(node instanceof Element && node.hasAttribute('data-export-ignore'))
    return toPng(previewRef.current, {
      quality: 1,
      pixelRatio: exportScale,
      backgroundColor: theme.background,
      filter: exportFilter,
      cacheBust: true,
      preferredFontFormat: 'woff2',
    })
  }, [theme.background, theme.fontHeading, theme.fontBody, exportScale])

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportTextBackup = useCallback(() => {
    const base = sanitizeFilenameBase(pageTitle, t('backup.defaultName'))
    downloadBlob(
      new Blob([sourceText], { type: 'text/markdown;charset=utf-8' }),
      `${base}.md`
    )
  }, [pageTitle, sourceText, t])

  const handleDownload = useCallback(async () => {
    if (isEmpty || !previewRef.current) return
    setExporting(true)
    try {
      await ensureFontsReadyForCapture(theme.fontHeading, theme.fontBody)
      const name = pageTitle || t('export.defaultImageName')
      const docLang =
        typeof document !== 'undefined' && document.documentElement.lang
          ? document.documentElement.lang.replace(/"/g, '')
          : 'zh-CN'
      const { toPng, toJpeg, toBlob, toSvg } = await import('html-to-image')
      const el = previewRef.current
      const exportFilter = (node: Node) =>
        !(node instanceof Element && node.hasAttribute('data-export-ignore'))
      const opts = {
        quality: 0.95,
        pixelRatio: exportScale,
        backgroundColor: theme.background,
        filter: exportFilter,
        cacheBust: true,
        preferredFontFormat: 'woff2' as const,
      }

      if (exportFormat === 'png') {
        const dataURL = await toPng(el, opts)
        downloadBlob(await (await fetch(dataURL)).blob(), `${name}.png`)
      }

      else if (exportFormat === 'jpeg') {
        const dataURL = await toJpeg(el, { ...opts, quality: 0.92 })
        downloadBlob(await (await fetch(dataURL)).blob(), `${name}.jpg`)
      }

      else if (exportFormat === 'webp') {
        const blob = await toBlob(el, { ...opts, type: 'image/webp' })
        if (!blob) throw new Error(t('compose.errorWebp'))
        downloadBlob(blob, `${name}.webp`)
      }

      else if (exportFormat === 'svg') {
        const svgStr = await toSvg(el, {
          pixelRatio: 1,
          backgroundColor: theme.background,
          cacheBust: true,
          preferredFontFormat: 'woff2',
        })
        downloadBlob(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }), `${name}.svg`)
      }

      else if (exportFormat === 'clipboard') {
        const blob = await toBlob(el, opts)
        if (!blob) throw new Error(t('compose.errorBlob'))
        if (navigator.clipboard?.write) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        } else {
          downloadBlob(blob, `${name}.png`)
        }
      }

      else if (exportFormat === 'pdf') {
        const dataURL = await toPng(el, opts)
        const { jsPDF } = await import('jspdf')
        const img = new Image()
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = dataURL })
        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height],
        })
        pdf.addImage(dataURL, 'PNG', 0, 0, img.width, img.height)
        pdf.save(`${name}.pdf`)
      }

      else if (exportFormat === 'html') {
        const clone = el.cloneNode(true) as HTMLElement
        clone.querySelectorAll('[data-export-ignore]').forEach((n) => n.remove())
        const safeTitle = escapeHtml(name)
        const html = `<!doctype html><html lang="${docLang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${safeTitle}</title></head><body style="margin:0;padding:24px;background:${theme.background};font-family:${theme.fontBody};color:${theme.text};"><article style="max-width:${preset.contentWidth}px;margin:0 auto;">${clone.innerHTML}</article></body></html>`
        downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `${name}.html`)
      }

      else if (exportFormat === 'markdown') {
        downloadBlob(new Blob([sourceText], { type: 'text/markdown;charset=utf-8' }), `${name}.md`)
      }

      flashDone('export')
    } finally {
      setExporting(false)
    }
  }, [isEmpty, pageTitle, exportFormat, exportScale, theme.background, theme.fontHeading, theme.fontBody, theme.text, preset.contentWidth, sourceText, t])

  const openExport = useCallback(() => {
    if (isEmpty) return
    setShowExportDialog(true)
  }, [isEmpty])

  const handleShare = useCallback(async () => {
    if (isEmpty) return
    setSharing(true)
    try {
      const dataURL = await captureImage()
      if (!dataURL) {
        showToast({ variant: 'error', message: t('toast.captureFailed') })
        return
      }
      const { shareImage } = await import('@/lib/capacitor/share')
      await shareImage(dataURL, pageTitle || t('export.defaultImageName'))
    } catch {
      showToast({ variant: 'error', message: t('toast.shareFailed') })
    } finally {
      setSharing(false)
    }
  }, [isEmpty, captureImage, pageTitle, t, showToast])

  const handleSave = useCallback(async () => {
    if (isEmpty) return
    const dataURL = await captureImage()
    if (!dataURL) {
      showToast({ variant: 'error', message: t('toast.captureFailed') })
      return
    }
    const r = await saveToGallery(dataURL)
    if (!r.ok) {
      const detail =
        r.error.length > 120 ? `${r.error.slice(0, 120)}…` : r.error
      showToast({ variant: 'error', message: t('toast.saveFailed', { detail }) })
      return
    }
    flashDone('save')
  }, [isEmpty, captureImage, saveToGallery, showToast, t])

  // ── Shared preview node (used by both desktop & mobile) ──────────────────
  const previewNode = isEmpty ? (
    <EmptyPreviewState onGoWrite={() => setMobileTab('write')} isMobile={mobileTab === 'preview'} />
  ) : (
    <ScaledPreviewContainer contentWidth={preset.contentWidth}>
      <LongImagePreview
        ref={previewRef}
        blocks={mergeBlocks(blocks, imageBlocks)}
        theme={theme}
        preset={preset}
        watermarkText={watermarkText || undefined}
        markdownEnabled={markdownEnabled}
        onDeleteImageBlock={removeImageBlock}
        deleteImageLabel={t('image.deleteAria')}
      />
    </ScaledPreviewContainer>
  )

  return (
    <div className="h-[100dvh] min-h-[100dvh] sm:min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50/40 dark:from-gray-950 dark:to-gray-950 overflow-hidden overscroll-y-contain">

      {/* ═══ TOP BAR ════════════════════════════════════════════════════════ */}
      <header className="flex items-center gap-2 px-3 sm:px-4 min-h-[3.25rem] sm:h-14 pt-[env(safe-area-inset-top,0px)] border-b border-[#E7E1D4] dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-gray-950/80 z-30 flex-shrink-0">
        {/* Logo + recent works */}
        <RecentWorksDropdown
          currentPageId={pageId}
          onSelectPage={(id) => {
            void (async () => {
              const result = await loadPage(id)
              if (result === false) {
                showToast({ variant: 'error', message: t('toast.loadFailed') })
              } else if (result === true) {
                router.replace(`/compose?id=${id}`)
              }
            })()
          }}
          onNewPage={resetPage}
        />

        {/* Title input */}
        <label htmlFor="compose-title" className="sr-only">{t('compose.titleLabel')}</label>
        <input
          id="compose-title"
          type="text"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          placeholder={t('compose.titlePlaceholder')}
          aria-label={t('compose.titleAria')}
          className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-600 outline-none bg-transparent min-w-0 px-1"
        />

        <button
          type="button"
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          title={t('lang.switch')}
          aria-label={t('lang.switch')}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 border border-[#E7E1D4]/80 dark:border-gray-700/80 flex-shrink-0 touch-manipulation"
        >
          <Languages size={14} className="text-gray-500 dark:text-gray-500" />
          <span className="tabular-nums w-[2.25rem] text-center">{locale === 'zh' ? 'EN' : '中文'}</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme(resolvedDark ? 'light' : 'dark')}
          title={resolvedDark ? t('theme.light') : t('theme.dark')}
          aria-label={resolvedDark ? t('theme.light') : t('theme.dark')}
          className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 border border-[#E7E1D4]/80 dark:border-gray-700/80 flex-shrink-0 touch-manipulation"
        >
          {resolvedDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <Link
          href="/gallery"
          title={t('gallery.title')}
          aria-label={t('compose.galleryLinkAria')}
          className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 border border-[#E7E1D4]/80 dark:border-gray-700/80 flex-shrink-0 touch-manipulation"
        >
          <LayoutGrid size={16} className="text-gray-500 dark:text-gray-500" />
        </Link>

        {/* Desktop-only: style + save + reset */}
        <div className="hidden sm:flex items-center gap-1.5">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 mr-1">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo()}
              title={t('compose.undoTitle')}
              aria-label={t('compose.undo')}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo()}
              title={t('compose.redoTitle')}
              aria-label={t('compose.redo')}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <Redo2 size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => resetPage()}
            title={t('compose.new')}
            aria-label={t('compose.newAria')}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowStyle((v) => !v)}
            aria-label={t('compose.styleAria')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showStyle ? 'bg-[#171717] text-white dark:bg-gray-100 dark:text-gray-900' : 'text-gray-700 dark:text-gray-300 hover:bg-[#F6F2EA] dark:hover:bg-gray-800'
            }`}
          >
            <Settings2 size={13} />
            {t('compose.style')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isEmpty || isSaving}
            aria-label={t('compose.saveAria')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 disabled:opacity-40 transition-colors duration-200"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> :
              actionDone === 'save' ? <Check size={12} className="text-green-500" /> :
              <BookmarkPlus size={12} />}
            {actionDone === 'save' ? t('compose.saved') : t('compose.save')}
          </button>
        </div>

        {/* Export — always visible */}
        <button
          type="button"
          onClick={openExport}
          disabled={isEmpty || exporting}
          aria-label={t('compose.exportAria')}
          className="flex items-center justify-center gap-1.5 px-3 sm:px-4 min-h-[40px] sm:min-h-0 sm:h-8 rounded-xl text-sm font-semibold bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-40 transition-colors duration-200 flex-shrink-0 touch-manipulation"
        >
          {exporting ? <Loader2 size={13} className="animate-spin" /> :
            actionDone === 'export' ? <Check size={13} /> :
            <Download size={13} />}
          <span>{t('compose.export')}</span>
        </button>
      </header>

      <LocalDataHintBanner onExportBackup={handleExportTextBackup} />

      {/* ═══ MOBILE TAB BAR ═════════════════════════════════════════════════ */}
      <div className="flex sm:hidden border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0 min-h-[48px]">
        {(['write', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 min-h-[48px] text-xs font-semibold transition-colors relative touch-manipulation active:bg-gray-50 dark:active:bg-gray-800 ${
              mobileTab === tab ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            {tab === 'write' ? <Pencil size={12} /> : <Eye size={12} />}
            {tab === 'write' ? t('compose.tabWrite') : t('compose.tabPreview')}
            {mobileTab === tab && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#B58A3A] rounded-t-full" />
            )}
            {tab === 'preview' && !isEmpty && mobileTab !== 'preview' && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute top-2 right-[calc(25%-4px)]" />
            )}
          </button>
        ))}
      </div>

      {/* ═══ MAIN AREA ══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden min-h-0 gap-0">

        {/* ── LEFT PANEL: pure text editor ── */}
        <div className={`
          flex flex-col border-r border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-950
          w-full sm:w-[40%] xl:w-[36%] flex-shrink-0
          ${mobileTab === 'preview' ? 'hidden sm:flex' : 'flex'}
        `}>
          {/* Textarea */}
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-3 min-h-0">
            <TextInputArea />
          </div>

          {/* Mobile: template strip + action row */}
          <div className="sm:hidden flex-shrink-0">
            {/* Template strip */}
            <div className="border-t border-gray-200/80 dark:border-gray-800 px-4 pt-3 pb-2 bg-white dark:bg-gray-950">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2.5">
                {t('compose.step2')}
              </p>
              <TemplateSelector />
            </div>
            {/* Bottom action row */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-950 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => {
                  setMobileTab('preview')
                  setShowStyle(true)
                }}
                aria-label={t('compose.styleAdjustAria')}
                className="flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-semibold border border-[#E7E1D4] dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#FAF7F2] dark:hover:bg-gray-800 active:bg-[#F6F2EA] dark:active:bg-gray-800 transition-colors duration-200 touch-manipulation"
              >
                <Settings2 size={13} />
                {t('compose.styleAdjust')}
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                disabled={isEmpty}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white dark:bg-gray-100 dark:text-gray-900 disabled:opacity-40 active:bg-[#2A2A2A] dark:active:bg-gray-200 transition-colors duration-200 touch-manipulation"
              >
                {t('compose.step3Preview')}
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: template strip + preview ── */}
        <div className={`
          flex-1 flex flex-col min-h-0 min-w-0
          ${mobileTab === 'write' ? 'hidden sm:flex' : 'flex'}
        `}>
          {/* Template strip — desktop only */}
          <div className="hidden sm:flex flex-shrink-0 border-b border-gray-200/80 dark:border-gray-800 px-5 py-3 bg-white/95 dark:bg-gray-950/95 items-start gap-3">
            <div className="flex-1 min-w-0">
              <TemplateSelector />
            </div>
            <button
              type="button"
              disabled={isEmpty}
              onClick={openFullscreenPreview}
              title={t('compose.fullscreenTitle')}
              aria-label={t('compose.fullscreenAria')}
              className="mt-0.5 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7E1D4] dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-gray-800 disabled:opacity-35 disabled:pointer-events-none flex-shrink-0 touch-manipulation"
            >
              <Maximize2 size={15} />
              {t('compose.fullscreen')}
            </button>
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/80 to-gray-100/40 dark:from-gray-900 dark:to-gray-900 min-h-0">
            {previewNode}
          </div>

          {/* Mobile preview: bottom action bar */}
          {mobileTab === 'preview' && !isEmpty && (
            <div className="sm:hidden flex-shrink-0 border-t border-[#E7E1D4] dark:border-gray-800 bg-white dark:bg-gray-950 pb-[env(safe-area-inset-bottom,0px)]">
              {/* Undo/Redo row */}
              <div className="flex items-center justify-between gap-2 px-4 pt-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={undo}
                    disabled={!canUndo()}
                    title={t('compose.undo')}
                    aria-label={t('compose.undo')}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 disabled:opacity-30 transition-colors touch-manipulation"
                  >
                    <Undo2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={redo}
                    disabled={!canRedo()}
                    title={t('compose.redo')}
                    aria-label={t('compose.redo')}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-[#F6F2EA] dark:hover:bg-gray-800 disabled:opacity-30 transition-colors touch-manipulation"
                  >
                    <Redo2 size={15} />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={isEmpty}
                  onClick={openFullscreenPreview}
                  aria-label={t('compose.fullscreenAria')}
                  className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl border border-[#E7E1D4] dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-gray-800 disabled:opacity-35 touch-manipulation"
                >
                  <Maximize2 size={16} />
                  {t('compose.fullscreen')}
                </button>
              </div>
              {/* Main action row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  aria-label={t('compose.saveAria')}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px] py-2.5 rounded-xl text-sm font-semibold border border-[#E7E1D4] dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 disabled:opacity-40 active:bg-gray-50 dark:active:bg-gray-800 touch-manipulation"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> :
                    actionDone === 'save' ? <Check size={14} className="text-green-500" /> :
                    <BookmarkPlus size={14} />}
                  {actionDone === 'save' ? t('compose.saved') : t('compose.save')}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  aria-label={t('compose.shareAria')}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px] py-2.5 rounded-xl text-sm font-semibold border border-[#E7E1D4] dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 disabled:opacity-40 active:bg-gray-50 dark:active:bg-gray-800 touch-manipulation"
                >
                  {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                  {t('compose.share')}
                </button>
                <button
                  type="button"
                  onClick={openExport}
                  disabled={isEmpty || exporting}
                  aria-label={t('compose.exportAria')}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px] py-2.5 rounded-xl text-sm font-semibold bg-[#171717] text-white dark:bg-gray-100 dark:text-gray-900 disabled:opacity-40 active:bg-[#2A2A2A] dark:active:bg-gray-200 touch-manipulation"
                >
                  {exporting ? <Loader2 size={14} className="animate-spin" /> :
                    actionDone === 'export' ? <Check size={14} /> :
                    <Download size={14} />}
                  {t('compose.export')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── DESKTOP STYLE PANEL: docked, non-overlapping ── */}
        {showStyle && (
          <aside className="hidden sm:flex w-[360px] border-l border-[#E7E1D4] dark:border-gray-800 bg-white dark:bg-gray-950 flex-col flex-shrink-0">
            {/* Panel header */}
            <div className="px-4 pt-3 pb-0 border-b border-[#E7E1D4] dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-0">
                  <button
                    type="button"
                    onClick={() => setSidePanel('style')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                      sidePanel === 'style'
                        ? 'border-[#171717] dark:border-gray-300 text-[#171717] dark:text-gray-200'
                        : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                    }`}
                  >
                    <Settings2 size={12} />
                    {t('compose.sideStyle')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidePanel('history')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                      sidePanel === 'history'
                        ? 'border-[#171717] dark:border-gray-300 text-[#171717] dark:text-gray-200'
                        : 'border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                    }`}
                  >
                    <History size={12} />
                    {t('compose.sideHistory')}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStyle(false)}
                  aria-label={t('compose.closePanelAria')}
                  className="w-7 h-7 mb-1 flex items-center justify-center rounded-lg hover:bg-[#F6F2EA] dark:hover:bg-gray-800 text-[#7C7467] dark:text-gray-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/40 dark:bg-gray-900/40">
              {sidePanel === 'style' ? (
                <CustomizePanel />
              ) : (
                <VersionHistoryPanel pageId={pageId} />
              )}
            </div>
          </aside>
        )}
      </div>

      <FullscreenPreviewLayer
        open={fullscreenPreviewOpen}
        onClose={() => setFullscreenPreviewOpen(false)}
        contentWidth={preset.contentWidth}
        blocks={mergeBlocks(blocks, imageBlocks)}
        theme={theme}
        preset={preset}
        watermarkText={watermarkText || undefined}
        markdownEnabled={markdownEnabled}
      />

      {/* ═══ STYLE DRAWER ═══════════════════════════════════════════════════ */}
      <StyleDrawer
        open={showStyle}
        onClose={() => setShowStyle(false)}
      />

      {/* ═══ EXPORT DIALOG ══════════════════════════════════════════════════ */}
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={handleDownload}
      />
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyPreviewState({
  onGoWrite,
  isMobile,
}: {
  onGoWrite: () => void
  isMobile: boolean
}) {
  const { t } = useI18n()
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16 min-h-[400px]">
      {/* Document icon */}
      <svg
        className="w-14 h-14 text-gray-200 dark:text-gray-700 mb-6"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="8" y="4" width="32" height="42" rx="4" fill="currentColor" />
        <rect x="8" y="4" width="32" height="42" rx="4" fill="white" fillOpacity="0.6" />
        <rect x="14" y="14" width="20" height="2.5" rx="1.25" fill="#D1D5DB" />
        <rect x="14" y="20" width="14" height="2" rx="1" fill="#E5E7EB" />
        <rect x="14" y="25" width="20" height="2" rx="1" fill="#E5E7EB" />
        <rect x="14" y="30" width="17" height="2" rx="1" fill="#E5E7EB" />
        <rect x="14" y="35" width="20" height="2" rx="1" fill="#E5E7EB" />
        <rect x="30" y="4" width="10" height="10" rx="0" fill="#F3F4F6" />
        <path d="M30 4 L40 14 L30 14 Z" fill="#E5E7EB" />
      </svg>

      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('compose.emptyPreviewTitle')}</p>
      <p className="text-xs text-gray-500 dark:text-gray-600 max-w-[220px] leading-relaxed">
        {isMobile ? t('compose.emptyPreviewMobile') : t('compose.emptyPreviewDesktop')}
      </p>

      {isMobile && (
        <button
          type="button"
          onClick={onGoWrite}
          className="mt-6 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs font-semibold touch-manipulation min-h-[44px]"
        >
          <Pencil size={12} />
          {t('compose.goWrite')}
        </button>
      )}
    </div>
  )
}
