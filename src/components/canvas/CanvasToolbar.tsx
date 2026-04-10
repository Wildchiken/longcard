'use client'

import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { createTextLayer, createRectLayer, createCircleLayer } from '@/lib/fabric/object-factory'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Type, Image, Square, Circle, Undo2, Redo2,
  LayoutTemplate, Palette, Download, Trash2, Copy,
  AlignCenter, AlignLeft, AlignRight, Lock, Unlock, PaintBucket,
} from 'lucide-react'
import { serializeCanvas, syncLayersFromCanvas, deserializeCanvas } from '@/lib/fabric/serialization'

export function CanvasToolbar() {
  const {
    fabricCanvas,
    activeTool, setActiveTool,
    canUndo, canRedo, undo, redo,
    setActivePanel,
    activeObjectId, activeObjectType,
    setLayers, pushHistory,
  } = useEditorStore()

  const addText = useCallback(async () => {
    if (!fabricCanvas) return
    setActiveTool('text')
    const obj = await createTextLayer({
      left: 80,
      top: 80,
      text: '点击输入文字',
      fontSize: 60,
      fontFamily: 'Playfair Display',
      fill: fabricCanvas.getObjects().length === 0 ? '#1A1A1A' : '#1A1A1A',
    })
    fabricCanvas.add(obj)
    fabricCanvas.setActiveObject(obj)
    fabricCanvas.requestRenderAll()
  }, [fabricCanvas, setActiveTool])

  const addRect = useCallback(async () => {
    if (!fabricCanvas) return
    const obj = await createRectLayer({
      shapeType: 'rect',
      left: 100,
      top: 100,
      width: 300,
      height: 200,
      fill: '#E5E5E5',
    })
    fabricCanvas.add(obj)
    fabricCanvas.setActiveObject(obj)
    fabricCanvas.requestRenderAll()
  }, [fabricCanvas])

  const addCircle = useCallback(async () => {
    if (!fabricCanvas) return
    const obj = await createCircleLayer({
      shapeType: 'circle',
      left: 200,
      top: 200,
      width: 200,
      height: 200,
      fill: '#E5E5E5',
    })
    fabricCanvas.add(obj)
    fabricCanvas.setActiveObject(obj)
    fabricCanvas.requestRenderAll()
  }, [fabricCanvas])

  const addImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !fabricCanvas) return
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const src = ev.target?.result as string
        const { createImageLayer } = await import('@/lib/fabric/object-factory')
        try {
          const img = await createImageLayer({ src, left: 80, top: 80 })
          // Scale to fit canvas reasonably
          const canvasWidth = fabricCanvas._logicalWidth * fabricCanvas._scale
          const maxW = canvasWidth * 0.8
          if (img.getScaledWidth() > maxW) {
            img.scaleToWidth(maxW)
          }
          fabricCanvas.add(img)
          fabricCanvas.setActiveObject(img)
          fabricCanvas.requestRenderAll()
        } catch (err) {
          console.error('Failed to add image:', err)
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [fabricCanvas])

  const handleUndo = useCallback(async () => {
    const json = undo()
    if (json && fabricCanvas) {
      await deserializeCanvas(fabricCanvas, json)
      setLayers(syncLayersFromCanvas(fabricCanvas))
    }
  }, [undo, fabricCanvas, setLayers])

  const handleRedo = useCallback(async () => {
    const json = redo()
    if (json && fabricCanvas) {
      await deserializeCanvas(fabricCanvas, json)
      setLayers(syncLayersFromCanvas(fabricCanvas))
    }
  }, [redo, fabricCanvas, setLayers])

  const deleteSelected = useCallback(() => {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject()
    if (active) {
      fabricCanvas.remove(active)
      fabricCanvas.requestRenderAll()
    }
  }, [fabricCanvas])

  const duplicateSelected = useCallback(async () => {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject()
    if (!active) return
    const { v4: uuid } = await import('uuid')
    active.clone().then((cloned: any) => {
      cloned.set({ left: (cloned.left ?? 0) + 20, top: (cloned.top ?? 0) + 20 })
      cloned.id = uuid()
      fabricCanvas.add(cloned)
      fabricCanvas.setActiveObject(cloned)
      fabricCanvas.requestRenderAll()
    })
  }, [fabricCanvas])

  const toggleLock = useCallback(() => {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject() as any
    if (!active) return
    const newLocked = !active.locked
    active.locked = newLocked
    active.selectable = !newLocked
    active.evented = !newLocked
    fabricCanvas.requestRenderAll()
    pushHistory(serializeCanvas(fabricCanvas))
  }, [fabricCanvas, pushHistory])

  const getActiveObj = () => fabricCanvas?.getActiveObject() as any

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Add Elements */}
      <div className="flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
        <ToolBtn icon={Type} label="添加文字" onClick={addText} active={activeTool === 'text'} />
        <ToolBtn icon={Image} label="添加图片" onClick={addImage} />
        <ToolBtn icon={Square} label="添加矩形" onClick={addRect} />
        <ToolBtn icon={Circle} label="添加圆形" onClick={addCircle} />
      </div>

      {/* History */}
      <div className="flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
        <ToolBtn icon={Undo2} label="撤销 (Ctrl+Z)" onClick={handleUndo} disabled={!canUndo} />
        <ToolBtn icon={Redo2} label="重做 (Ctrl+Y)" onClick={handleRedo} disabled={!canRedo} />
      </div>

      {/* Object Actions */}
      {activeObjectId && (
        <div className="flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
          <ToolBtn icon={Copy} label="复制" onClick={duplicateSelected} />
          <ToolBtn icon={getActiveObj()?.locked ? Lock : Unlock} label={getActiveObj()?.locked ? '解锁' : '锁定'} onClick={toggleLock} />
          <ToolBtn icon={Trash2} label="删除" onClick={deleteSelected} className="text-red-500 hover:text-red-600" />
        </div>
      )}

      {/* Panels */}
      <div className="flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-1 shadow-sm ml-auto">
        <ToolBtn icon={LayoutTemplate} label="模板" onClick={() => setActivePanel('templates')} />
        <ToolBtn icon={Palette} label="主题" onClick={() => setActivePanel('theme')} />
        <ToolBtn icon={PaintBucket} label="背景颜色" onClick={() => setActivePanel('background')} />
        <ToolBtn icon={Download} label="导出" onClick={() => setActivePanel('export')} />
      </div>
    </div>
  )
}

interface ToolBtnProps {
  icon: React.ComponentType<{ className?: string; size?: number }>
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  className?: string
}

function ToolBtn({ icon: Icon, label, onClick, active, disabled, className }: ToolBtnProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
          active
            ? 'bg-gray-900 text-white shadow hover:bg-gray-800'
            : 'hover:bg-gray-100 hover:text-gray-900'
        } ${className ?? ''}`}
      >
        <Icon size={16} />
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}
