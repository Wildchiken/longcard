'use client'

import { usePageStore } from '@/store/page-store'
import { CURATED_FONTS } from '@/lib/fonts/registry'
import { loadFont } from '@/lib/fonts/loader'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export function BlockStylePanel() {
  const { blocks, selectedBlockId, updateBlock } = usePageStore()
  const block = blocks.find((b) => b.id === selectedBlockId)

  if (!block || block.type === 'divider' || block.type === 'spacer' || block.type === 'image') {
    return (
      <div className="p-4 text-center text-xs text-gray-400">
        选择一个文字块来编辑样式
      </div>
    )
  }

  const style = block.style ?? {}

  const update = (patch: Partial<typeof style>) => {
    updateBlock(block.id, { style: { ...style, ...patch } })
  }

  const handleFont = async (family: string | null) => {
    if (!family) return
    await loadFont(family)
    update({ fontFamily: family })
  }

  const handleFontSize = (val: number | readonly number[]) => {
    const n = Array.isArray(val) ? (val as number[])[0] : (val as number)
    update({ fontSize: n })
  }

  const handleLineHeight = (val: number | readonly number[]) => {
    const n = Array.isArray(val) ? (val as number[])[0] : (val as number)
    update({ lineHeight: n })
  }

  return (
    <div className="p-4 space-y-5">
      <div>
        <Label className="text-xs text-gray-500 mb-2 block">字体</Label>
        <Select value={style.fontFamily ?? ''} onValueChange={handleFont}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="选择字体" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {CURATED_FONTS.map((f) => (
              <SelectItem key={f.id} value={f.family} style={{ fontFamily: f.family }}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-500">字号</Label>
          <span className="text-xs font-mono text-gray-700">{style.fontSize ?? 16}px</span>
        </div>
        <Slider min={10} max={80} step={1} value={[style.fontSize ?? 16]} onValueChange={handleFontSize} />
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">样式</Label>
        <div className="flex gap-1">
          <Button variant={style.bold ? 'default' : 'outline'} size="icon" className="h-8 w-8"
            onClick={() => update({ bold: !style.bold })}><Bold size={14} /></Button>
          <Button variant={style.italic ? 'default' : 'outline'} size="icon" className="h-8 w-8"
            onClick={() => update({ italic: !style.italic })}><Italic size={14} /></Button>
          <div className="ml-auto flex gap-1">
            <Button variant={style.textAlign === 'left' ? 'default' : 'outline'} size="icon" className="h-8 w-8"
              onClick={() => update({ textAlign: 'left' })}><AlignLeft size={14} /></Button>
            <Button variant={style.textAlign === 'center' ? 'default' : 'outline'} size="icon" className="h-8 w-8"
              onClick={() => update({ textAlign: 'center' })}><AlignCenter size={14} /></Button>
            <Button variant={style.textAlign === 'right' ? 'default' : 'outline'} size="icon" className="h-8 w-8"
              onClick={() => update({ textAlign: 'right' })}><AlignRight size={14} /></Button>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">颜色</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={style.color ?? '#1A1A1A'}
            onChange={(e) => update({ color: e.target.value })}
            className="h-9 w-14 rounded border border-gray-200 cursor-pointer p-0.5"
          />
          <span className="text-sm font-mono text-gray-700">{(style.color ?? '#1A1A1A').toUpperCase()}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-500">行间距</Label>
          <span className="text-xs font-mono text-gray-700">{(style.lineHeight ?? 1.8).toFixed(1)}</span>
        </div>
        <Slider min={1} max={3} step={0.1} value={[style.lineHeight ?? 1.8]} onValueChange={handleLineHeight} />
      </div>
    </div>
  )
}
