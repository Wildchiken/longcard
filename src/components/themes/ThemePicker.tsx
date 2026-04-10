'use client'

import { COLOR_THEMES, getThemeById } from '@/lib/themes/palettes'
import { useEditorStore } from '@/store/editor-store'
import { serializeCanvas, syncLayersFromCanvas } from '@/lib/fabric/serialization'
import { Check } from 'lucide-react'

export function ThemePicker() {
  const { fabricCanvas, themeId, setThemeId, pushHistory, setLayers } = useEditorStore()

  const applyTheme = (id: string) => {
    setThemeId(id)
    if (!fabricCanvas) return

    const theme = getThemeById(id)
    fabricCanvas.set('backgroundColor', theme.colors.background)

    // Apply theme colors to text objects
    const objects = fabricCanvas.getObjects() as any[]
    objects.forEach((obj) => {
      if (obj.layerType === 'text' && obj.fill === getThemeById(themeId).colors.text) {
        obj.set({ fill: theme.colors.text })
      }
    })

    fabricCanvas.requestRenderAll()
    pushHistory(serializeCanvas(fabricCanvas))
    setLayers(syncLayersFromCanvas(fabricCanvas))
  }

  return (
    <div className="p-3 overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        {COLOR_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className={`rounded-xl border-2 overflow-hidden transition-all ${
              themeId === theme.id ? 'border-gray-900 shadow-md' : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div
              className="w-full h-16 relative"
              style={{ backgroundColor: theme.colors.background }}
            >
              {/* Color swatches */}
              <div className="absolute bottom-2 left-2 flex gap-1">
                {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              {themeId === theme.id && (
                <div className="absolute top-2 right-2 bg-gray-900 text-white rounded-full p-0.5">
                  <Check size={10} />
                </div>
              )}
            </div>
            <div className="px-2 py-1.5" style={{ backgroundColor: theme.colors.surface }}>
              <p className="text-[11px] font-semibold truncate" style={{ color: theme.colors.text }}>{theme.name}</p>
              <p className="text-[10px] truncate" style={{ color: theme.colors.textMuted }}>{theme.aesthetic}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
