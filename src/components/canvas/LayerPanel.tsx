'use client'

import { useEditorStore } from '@/store/editor-store'
import { Eye, EyeOff, Lock, Unlock, Type, Image as ImageIcon, Square, Circle } from 'lucide-react'
import { serializeCanvas, syncLayersFromCanvas } from '@/lib/fabric/serialization'
import type { LayerMeta } from '@/types/layer'

export function LayerPanel() {
  const { layers, fabricCanvas, pushHistory, setLayers, activeObjectId } = useEditorStore()

  const getIcon = (type: LayerMeta['type']) => {
    if (type === 'text') return <Type size={12} />
    if (type === 'image') return <ImageIcon size={12} />
    if (type === 'decoration') return <Square size={12} />
    return <Circle size={12} />
  }

  const selectLayer = (fabricId: string) => {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getObjects().find((o: any) => o.id === fabricId)
    if (obj) {
      fabricCanvas.setActiveObject(obj)
      fabricCanvas.requestRenderAll()
    }
  }

  const toggleVisibility = (fabricId: string) => {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getObjects().find((o: any) => o.id === fabricId) as any
    if (!obj) return
    obj.set({ visible: !obj.visible })
    fabricCanvas.requestRenderAll()
    pushHistory(serializeCanvas(fabricCanvas))
    setLayers(syncLayersFromCanvas(fabricCanvas))
  }

  const toggleLock = (fabricId: string) => {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getObjects().find((o: any) => o.id === fabricId) as any
    if (!obj) return
    const newLocked = !obj.locked
    obj.locked = newLocked
    obj.selectable = !newLocked
    obj.evented = !newLocked
    fabricCanvas.requestRenderAll()
    pushHistory(serializeCanvas(fabricCanvas))
    setLayers(syncLayersFromCanvas(fabricCanvas))
  }

  const reversed = [...layers].reverse()

  if (reversed.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-gray-400">
        <p>暂无图层</p>
        <p className="mt-1">使用顶部工具栏添加内容</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto">
      {reversed.map((layer) => (
        <div
          key={layer.fabricId}
          onClick={() => selectLayer(layer.fabricId)}
          className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${
            activeObjectId === layer.fabricId ? 'bg-blue-50 hover:bg-blue-50' : ''
          }`}
        >
          <span className="text-gray-400">{getIcon(layer.type)}</span>
          <span className="flex-1 truncate text-gray-700 font-medium">{layer.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.fabricId) }}
            className="text-gray-400 hover:text-gray-700 p-0.5 rounded"
          >
            {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLock(layer.fabricId) }}
            className="text-gray-400 hover:text-gray-700 p-0.5 rounded"
          >
            {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
        </div>
      ))}
    </div>
  )
}
