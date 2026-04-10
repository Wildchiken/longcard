'use client'

import { useState } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { serializeCanvas } from '@/lib/fabric/serialization'
import { getThemeById } from '@/lib/themes/palettes'
import { Label } from '@/components/ui/label'

const PRESET_COLORS = [
  '#FFFFFF', '#F8F8F8', '#F5F0E8', '#F4ECD8', '#F0F4EF',
  '#F5F0FF', '#FFF0F3', '#E8F4F8', '#1A1A1A', '#0A0E1A',
  '#1C1914', '#2A2520', '#0D0D1A', '#F5E6D3', '#F7F3ED',
]

export function BackgroundPanel() {
  const { fabricCanvas, themeId, pushHistory } = useEditorStore()
  const theme = getThemeById(themeId)
  const [custom, setCustom] = useState(theme.colors.background)

  const applyBg = (color: string) => {
    if (!fabricCanvas) return
    fabricCanvas.set('backgroundColor', color)
    fabricCanvas.requestRenderAll()
    pushHistory(serializeCanvas(fabricCanvas))
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <Label className="text-xs text-gray-500 mb-3 block">背景颜色</Label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setCustom(c); applyBg(c) }}
              className="w-9 h-9 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform ring-1 ring-gray-200"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs text-gray-500 mb-2 block">自定义颜色</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); applyBg(e.target.value) }}
            className="h-9 w-14 rounded border border-gray-200 cursor-pointer p-0.5"
          />
          <span className="text-sm font-mono text-gray-700">{custom.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}
