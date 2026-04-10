'use client'

import { useState } from 'react'
import { TEMPLATES } from '@/lib/templates/registry'
import { applyTemplate } from '@/lib/templates/applier'
import { useEditorStore } from '@/store/editor-store'
import { serializeCanvas, syncLayersFromCanvas } from '@/lib/fabric/serialization'
import { CATEGORY_LABELS } from '@/types/template'
import type { TemplateCategory } from '@/types/template'
import { Button } from '@/components/ui/button'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TemplateCategory[]

export function TemplatePicker() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all')
  const { fabricCanvas, zineFormat, pushHistory, setLayers, setActivePanel } = useEditorStore()

  const filtered = activeCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory)

  const handleApply = async (templateId: string) => {
    if (!fabricCanvas) return
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    await applyTemplate(fabricCanvas, template)
    pushHistory(serializeCanvas(fabricCanvas))
    setLayers(syncLayersFromCanvas(fabricCanvas))
    setActivePanel(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 flex-wrap p-3 border-b border-gray-100">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            activeCategory === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => handleApply(template.id)}
              className="group rounded-xl overflow-hidden border-2 border-transparent hover:border-gray-900 transition-all text-left shadow-sm"
            >
              <div
                className="w-full aspect-square flex items-end p-2"
                style={{ backgroundColor: template.thumbnailColor }}
              >
                <span className="text-[10px] font-medium text-gray-500 bg-white/80 backdrop-blur rounded px-1.5 py-0.5 truncate w-full text-center">
                  {template.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
