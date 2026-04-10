'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/store/editor-store'
import { useGalleryStore } from '@/store/gallery-store'
import { serializeCanvas, syncLayersFromCanvas } from '@/lib/fabric/serialization'
import { generateThumbnail } from '@/lib/fabric/export'
import { CanvasToolbar } from './CanvasToolbar'
import { ObjectProperties } from './ObjectProperties'
import { LayerPanel } from './LayerPanel'
import { TemplatePicker } from '@/components/templates/TemplatePicker'
import { ThemePicker } from '@/components/themes/ThemePicker'
import { ExportPanel } from '@/components/export/ExportDialog'
import { BackgroundPanel } from './BackgroundPanel'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { ZineFormat } from '@/types/zine'
import type { Zine } from '@/types/zine'
import { FORMAT_DIMENSIONS } from '@/types/zine'
import { ArrowLeft, Save, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const ZineCanvas = dynamic(
  () => import('./ZineCanvas').then((m) => ({ default: m.ZineCanvas })),
  { ssr: false, loading: () => <div className="w-full aspect-square bg-gray-100 animate-pulse rounded-xl" /> }
)

interface EditorLayoutProps {
  zineId: string
  initialZine?: Zine | null
  format?: ZineFormat
}

export function EditorLayout({ zineId, initialZine, format = 'square' }: EditorLayoutProps) {
  const router = useRouter()
  const {
    fabricCanvas, isDirty, activePanel, setActivePanel,
    zineFormat, setZineId, setZineFormat, themeId,
    setLayers, pushHistory, propertiesPanelOpen, markClean,
  } = useEditorStore()
  const { upsertZine } = useGalleryStore()
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    setZineId(zineId)
    setZineFormat(initialZine?.format ?? format)
  }, [zineId, initialZine, format, setZineId, setZineFormat])

  const saveZine = useCallback(async () => {
    if (!fabricCanvas || isSavingRef.current) return
    isSavingRef.current = true
    try {
      const canvasJSON = serializeCanvas(fabricCanvas)
      const thumbnailDataURL = await generateThumbnail(fabricCanvas)
      const zine: Zine = {
        id: zineId,
        title: initialZine?.title ?? '未命名 Zine',
        format: zineFormat,
        templateId: null,
        themeId,
        canvasJSON,
        thumbnailDataURL,
        tags: initialZine?.tags ?? [],
        collectionId: initialZine?.collectionId ?? null,
        createdAt: initialZine?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        schemaVersion: 1,
      }
      await upsertZine(zine)
      markClean()
    } finally {
      isSavingRef.current = false
    }
  }, [fabricCanvas, zineId, zineFormat, themeId, initialZine, upsertZine, markClean])

  // Auto-save every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (isDirty) saveZine()
    }, 30000)
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [isDirty, saveZine])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        await saveZine()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [saveZine])

  const sidePanelContent = () => {
    if (activePanel === 'templates') return <TemplatePicker />
    if (activePanel === 'theme') return <ThemePicker />
    if (activePanel === 'export') return <ExportPanel />
    if (activePanel === 'layers') return <LayerPanel />
    if (activePanel === 'background') return <BackgroundPanel />
    return null
  }

  const sidePanelTitle: Record<string, string> = {
    templates: '选择模板',
    theme: '色彩主题',
    export: '导出作品',
    layers: '图层',
    background: '背景设置',
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-200 shadow-sm z-10">
          <Link href="/gallery">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft size={18} />
            </Button>
          </Link>

          <div className="flex-1">
            <CanvasToolbar />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setActivePanel(activePanel === 'layers' ? null : 'layers')}
            >
              <Layers size={18} />
            </Button>
            <Button
              onClick={saveZine}
              size="sm"
              className="h-9 gap-1.5 px-4 rounded-lg"
            >
              <Save size={15} />
              {isDirty ? '保存*' : '已保存'}
            </Button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas area */}
          <main className="flex-1 overflow-auto flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <ZineCanvas
                format={zineFormat}
                initialJSON={initialZine?.canvasJSON}
              />
            </div>
          </main>

          {/* Side panel (layers + active panel) */}
          {(activePanel || propertiesPanelOpen) && (
            <aside className="w-64 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-lg">
              {activePanel ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {sidePanelTitle[activePanel] ?? activePanel}
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {sidePanelContent()}
                  </div>
                </>
              ) : (
                <ObjectProperties />
              )}
            </aside>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
