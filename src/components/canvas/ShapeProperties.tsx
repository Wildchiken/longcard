'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { serializeCanvas } from '@/lib/fabric/serialization'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

export function ShapeProperties() {
  const { fabricCanvas, pushHistory } = useEditorStore()
  const [fill, setFill] = useState('#E5E5E5')
  const [stroke, setStroke] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(0)
  const [opacity, setOpacity] = useState(100)

  const getObj = useCallback(() => {
    return fabricCanvas?.getActiveObject() as any
  }, [fabricCanvas])

  useEffect(() => {
    const obj = getObj()
    if (!obj) return
    setFill(obj.fill ?? '#E5E5E5')
    setStroke(obj.stroke ?? 'transparent')
    setStrokeWidth(obj.strokeWidth ?? 0)
    setOpacity(Math.round((obj.opacity ?? 1) * 100))
  }, [getObj])

  const apply = useCallback((props: Record<string, any>) => {
    const obj = getObj()
    if (!obj || !fabricCanvas) return
    obj.set(props)
    fabricCanvas.requestRenderAll()
    pushHistory(serializeCanvas(fabricCanvas))
  }, [getObj, fabricCanvas, pushHistory])

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs text-gray-500 mb-2 block">填充色</Label>
        <div className="flex items-center gap-3">
          <input
            type="color" value={fill === 'transparent' ? '#E5E5E5' : fill}
            onChange={(e) => { setFill(e.target.value); apply({ fill: e.target.value }) }}
            className="h-9 w-14 rounded border border-gray-200 cursor-pointer p-0.5"
          />
          <span className="text-sm font-mono text-gray-700">{fill}</span>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">边框色</Label>
        <div className="flex items-center gap-3">
          <input
            type="color" value={stroke === 'transparent' ? '#000000' : stroke}
            onChange={(e) => { setStroke(e.target.value); apply({ stroke: e.target.value }) }}
            className="h-9 w-14 rounded border border-gray-200 cursor-pointer p-0.5"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-500">边框宽度</Label>
          <span className="text-xs font-mono text-gray-700">{strokeWidth}px</span>
        </div>
        <Slider min={0} max={20} step={1} value={[strokeWidth]}
          onValueChange={(v) => { const n = Array.isArray(v) ? v[0] : (v as number); setStrokeWidth(n); apply({ strokeWidth: n }) }} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-500">透明度</Label>
          <span className="text-xs font-mono text-gray-700">{opacity}%</span>
        </div>
        <Slider min={0} max={100} step={1} value={[opacity]}
          onValueChange={(v) => { const n = Array.isArray(v) ? v[0] : (v as number); setOpacity(n); apply({ opacity: n / 100 }) }} />
      </div>
    </div>
  )
}
