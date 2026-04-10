'use client'

import { useEditorStore } from '@/store/editor-store'
import { TextProperties } from './TextProperties'
import { ShapeProperties } from './ShapeProperties'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ObjectProperties() {
  const { activeObjectType, propertiesPanelOpen, setPropertiesPanelOpen } = useEditorStore()

  if (!propertiesPanelOpen || !activeObjectType) return null

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">
          {activeObjectType === 'text' ? '文字属性' :
           activeObjectType === 'image' ? '图片属性' :
           activeObjectType === 'shape' ? '形状属性' : '属性'}
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPropertiesPanelOpen(false)}>
          <X size={14} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeObjectType === 'text' && <TextProperties />}
        {activeObjectType === 'shape' && <ShapeProperties />}
        {activeObjectType === 'image' && <ImagePropertiesBasic />}
      </div>
    </div>
  )
}

function ImagePropertiesBasic() {
  const { fabricCanvas } = useEditorStore()

  const handleOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const obj = fabricCanvas?.getActiveObject() as any
    if (!obj) return
    obj.set({ opacity: parseFloat(e.target.value) / 100 })
    fabricCanvas?.requestRenderAll()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 mb-2 block">透明度</label>
        <input
          type="range" min="0" max="100" step="1"
          defaultValue="100"
          onChange={handleOpacity}
          className="w-full accent-gray-800"
        />
      </div>
    </div>
  )
}
