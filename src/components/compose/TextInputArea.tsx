'use client'

import { useMemo, useRef } from 'react'
import { useComposeStore } from '@/store/compose-store'
import { ImagePlus, Lightbulb, Sparkles } from 'lucide-react'
import { getSampleDemoText } from '@/lib/sample-demo-text'
import { useI18n } from '@/lib/i18n/context'
import { useToast } from '@/lib/toast-context'
import { compressImage } from '@/lib/compress-image'

function cursorToBlockIndex(text: string, cursorPos: number): number {
  return text.slice(0, cursorPos).split(/\n{2,}/).length - 1
}

function countWords(text: string): { chars: number; cn: number } {
  const chars = text.replace(/\s/g, '').length
  const cn = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length
  return { chars, cn }
}

export function TextInputArea() {
  const { locale, t } = useI18n()
  const { showToast } = useToast()
  const { sourceText, setSourceText, addImageBlock } = useComposeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingInsertIndex = useRef(0)

  const { chars, cn } = useMemo(() => countWords(sourceText), [sourceText])

  const hasText = sourceText.trim().length > 0

  const handleFillSample = () => {
    if (sourceText.trim() && !window.confirm(t('compose.replaceSampleConfirm'))) return
    setSourceText(getSampleDemoText(locale))
  }

  const handleAddImageClick = () => {
    const cursorPos = textareaRef.current?.selectionStart ?? sourceText.length
    pendingInsertIndex.current = cursorToBlockIndex(sourceText, cursorPos)
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const dataURL = await compressImage(file)
      addImageBlock(dataURL, pendingInsertIndex.current, file.name.replace(/\.[^.]+$/, ''))
    } catch {
      showToast({ variant: 'error', message: t('image.uploadError') })
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={handleImageUpload}
      />
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-500 tracking-wide pt-0.5">{t('compose.step1')}</p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleAddImageClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 touch-manipulation"
            aria-label={t('compose.addImageAria')}
            title={t('compose.addImageHint')}
          >
            <ImagePlus size={12} className="flex-shrink-0" />
            {t('compose.addImage')}
          </button>
          <button
            type="button"
            onClick={handleFillSample}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#8B6914] dark:text-amber-200 bg-[#FDF6E3] dark:bg-amber-950/50 border border-[#E8D4A8] dark:border-amber-800/60 hover:bg-[#FAEDD0] dark:hover:bg-amber-900/40 active:bg-[#F5E4C0] dark:active:bg-amber-900/55 touch-manipulation"
            aria-label={t('compose.fillSampleAria')}
          >
            <Sparkles size={12} className="flex-shrink-0" />
            {t('compose.fillSample')}
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4">
        <textarea
          ref={textareaRef}
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder={t('input.placeholder')}
          className="flex-1 w-full h-full resize-none outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-base sm:text-[14px] leading-7 font-sans p-0 min-h-[min(280px,45dvh)] sm:min-h-[220px]"
          enterKeyHint="enter"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
        />
      </div>

      {hasText ? (
        <div className="flex items-center justify-between pt-2 pb-1">
          <button
            type="button"
            onClick={() => setSourceText('')}
            className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label={t('compose.clearAria')}
          >
            {t('compose.clear')}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-500 tabular-nums">
            {t('compose.chars', { n: chars })}
            {cn > 0 ? t('compose.charsHan', { n: cn }) : ''}
          </span>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3">
          <Lightbulb size={13} className="mt-0.5 flex-shrink-0 text-amber-400 dark:text-amber-500" />
          <span>{t('compose.tip')}</span>
        </div>
      )}
    </div>
  )
}
