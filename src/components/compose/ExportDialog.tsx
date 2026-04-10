'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, AlertCircle, AlertTriangle, Info, Download, Loader2, Check, Copy } from 'lucide-react'
import { useComposeStore } from '@/store/compose-store'
import { runPreflight, hasErrors } from '@/lib/export/preflight'
import type { PreflightResult } from '@/lib/export/preflight'
import { useI18n } from '@/lib/i18n/context'
import { AsyncTimeoutError } from '@/lib/with-timeout'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

type ExportFormat = 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf' | 'html' | 'markdown' | 'clipboard'

function SeverityIcon({ s }: { s: 'error' | 'warn' | 'info' }) {
  if (s === 'error') return <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
  if (s === 'warn') return <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
  return <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
}

function FormatButton({ fmt, active, onClick }: {
  fmt: { value: ExportFormat; label: string; hint: string }
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-colors ${
        active
          ? 'bg-[#171717] border-[#171717] text-white dark:bg-gray-100 dark:border-gray-100 dark:text-gray-900'
          : 'border-[#E7E1D4] dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <span className="text-xs font-semibold">{fmt.label}</span>
      <span className={`text-[10px] mt-0.5 leading-tight ${active ? 'text-white/60 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'}`}>
        {fmt.hint}
      </span>
    </button>
  )
}

export function ExportDialog({ open, onClose, onConfirm }: ExportDialogProps) {
  const { t } = useI18n()
  const {
    blocks, effectivePreset, effectiveTheme,
    exportFormat, setExportFormat,
    exportScale, setExportScale,
    overrides, presetId,
  } = useComposeStore()
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current) }, [])

  const imageFormats = useMemo(
    () =>
      [
        { value: 'png' as const, label: 'PNG', hint: t('export.fmt.png.hint') },
        { value: 'jpeg' as const, label: 'JPEG', hint: t('export.fmt.jpeg.hint') },
        { value: 'webp' as const, label: 'WebP', hint: t('export.fmt.webp.hint') },
        { value: 'svg' as const, label: 'SVG', hint: t('export.fmt.svg.hint') },
        {
          value: 'clipboard' as const,
          label: t('export.fmt.clipboard.label'),
          hint: t('export.fmt.clipboard.hint'),
        },
      ] as const,
    [t]
  )

  const docFormats = useMemo(
    () =>
      [
        { value: 'pdf' as const, label: 'PDF', hint: t('export.fmt.pdf.hint') },
        { value: 'html' as const, label: 'HTML', hint: t('export.fmt.html.hint') },
        { value: 'markdown' as const, label: 'Markdown', hint: t('export.fmt.markdown.hint') },
      ] as const,
    [t]
  )

  const allFormats = useMemo(
    () => [...imageFormats, ...docFormats],
    [imageFormats, docFormats]
  )

  const [results, setResults] = useState<PreflightResult[]>([])
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const isImageFormat = ['png', 'jpeg', 'webp', 'svg', 'clipboard'].includes(exportFormat)

  useEffect(() => {
    if (!open) {
      setDone(false)
      setExportError(null)
      return
    }
    const preset = effectivePreset()
    const theme = effectiveTheme()
    const preflightFormat: 'image' | 'pdf' | 'html' =
      isImageFormat ? 'image' :
      exportFormat === 'markdown' ? 'html' :
      (exportFormat as 'pdf' | 'html')
    setResults(runPreflight({
      blocks,
      preset,
      bgColor: theme.background,
      textColor: theme.text,
      exportFormat: preflightFormat,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, blocks, exportFormat, overrides, presetId])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const blocked = hasErrors(results)
  const errors = results.filter((r) => r.severity === 'error')
  const warns = results.filter((r) => r.severity === 'warn')
  const infos = results.filter((r) => r.severity === 'info')

  const handleConfirm = async () => {
    setExporting(true)
    setExportError(null)
    try {
      await onConfirm()
      setDone(true)
      closeTimerRef.current = setTimeout(() => { onClose(); setDone(false); closeTimerRef.current = null }, 1200)
    } catch (e) {
      setExportError(e instanceof AsyncTimeoutError ? t('export.timeout') : t('export.fail'))
    } finally {
      setExporting(false)
    }
  }

  const getConfirmLabel = () => {
    if (done) return t('export.done')
    if (blocked) return t('export.fixFirst')
    if (exportFormat === 'clipboard') return t('export.copyImage')
    const found = allFormats.find((f) => f.value === exportFormat)
    return t('export.confirmFmt', { label: found?.label ?? '' })
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[440px] bg-white dark:bg-gray-950 rounded-2xl shadow-2xl flex flex-col max-h-[min(92dvh,720px)] ring-1 ring-black/5 dark:ring-white/10">

          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E1D4] dark:border-gray-800">
            <h2 className="text-sm font-semibold text-[#171717] dark:text-gray-100">{t('export.dialogTitle')}</h2>
            <button type="button" onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" aria-label={t('export.cancel')}>
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">{t('export.sectionImage')}</p>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {imageFormats.map((fmt) => (
                  <FormatButton
                    key={fmt.value}
                    fmt={fmt}
                    active={exportFormat === fmt.value}
                    onClick={() => setExportFormat(fmt.value)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">{t('export.sectionDoc')}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {docFormats.map((fmt) => (
                  <FormatButton
                    key={fmt.value}
                    fmt={fmt}
                    active={exportFormat === fmt.value}
                    onClick={() => setExportFormat(fmt.value)}
                  />
                ))}
              </div>
            </div>

            {isImageFormat && exportFormat !== 'svg' && exportFormat !== 'markdown' && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">{t('export.sectionScale')}</p>
                <div className="flex gap-2">
                  {([2, 3] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setExportScale(s)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                        exportScale === s
                          ? 'bg-[#171717] text-white border-[#171717] dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                          : 'border-[#E7E1D4] dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {s === 2 ? t('export.scale2') : t('export.scale3')}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {exportScale === 3 ? t('export.scaleHint3') : t('export.scaleHint2')}
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">{t('export.sectionCheck')}</p>
                <div className="rounded-xl border border-[#E7E1D4] dark:border-gray-700 divide-y divide-[#E7E1D4] dark:divide-gray-700 overflow-hidden">
                  {[...errors, ...warns, ...infos].map((r) => (
                    <div key={r.id} className={`flex gap-2.5 px-3 py-2.5 text-xs ${
                      r.severity === 'error' ? 'bg-red-50 dark:bg-red-950/40' :
                      r.severity === 'warn' ? 'bg-amber-50/70 dark:bg-amber-950/30' :
                      'bg-blue-50/40 dark:bg-blue-950/25'
                    }`}>
                      <SeverityIcon s={r.severity} />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {t(`preflight.${r.id}.message`, r.params)}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                          {t(`preflight.${r.id}.hint`, r.params)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.length === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/35 rounded-xl px-3 py-2.5">
                <Check size={12} />
                {t('export.allClear')}
              </div>
            )}

            {exportError && (
              <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/35 rounded-xl px-3 py-2.5 border border-red-100 dark:border-red-900/50">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{exportError}</span>
              </div>
            )}
          </div>

          <div className="px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#E7E1D4] dark:border-gray-800 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E7E1D4] dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('export.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={blocked || exporting}
              className="flex-1 flex items-center justify-center gap-2 min-h-[48px] py-2.5 rounded-xl text-sm font-semibold bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-40 transition-colors touch-manipulation"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> :
               done ? <Check size={14} /> :
               exportFormat === 'clipboard' ? <Copy size={14} /> :
               <Download size={14} />}
              {getConfirmLabel()}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
