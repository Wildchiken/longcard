'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { CURATED_FONTS } from '@/lib/fonts/registry'
import { loadFont } from '@/lib/fonts/loader'
import { serializeCanvas, syncLayersFromCanvas } from '@/lib/fabric/serialization'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export function TextProperties() {
  const { fabricCanvas, setLayers, pushHistory } = useEditorStore()
  const [fontSize, setFontSize] = useState(48)
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fill, setFill] = useState('#1A1A1A')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [lineHeight, setLineHeight] = useState(1.4)
  const [charSpacing, setCharSpacing] = useState(0)

  const getObj = useCallback(() => {
    if (!fabricCanvas) return null
    const obj = fabricCanvas.getActiveObject() as any
    if (!obj || obj.type !== 'i-text') return null
    return obj
  }, [fabricCanvas])

  useEffect(() => {
    const obj = getObj()
    if (!obj) return
    setFontSize(Math.round(obj.fontSize / (fabricCanvas?._scale ?? 1)))
    setFontFamily(obj.fontFamily ?? 'Inter')
    setFill(obj.fill ?? '#1A1A1A')
    setTextAlign(obj.textAlign ?? 'left')
    setBold(obj.fontWeight === 700 || obj.fontWeight === 'bold')
    setItalic(obj.fontStyle === 'italic')
    setUnderline(obj.underline === true)
    setLineHeight(obj.lineHeight ?? 1.4)
    setCharSpacing(obj.charSpacing ?? 0)
  }, [getObj, fabricCanvas])

  const applyProp = useCallback((props: Record<string, any>) => {
    const obj = getObj()
    if (!obj || !fabricCanvas) return
    obj.set(props)
    fabricCanvas.requestRenderAll()
    pushHistory(serializeCanvas(fabricCanvas))
    setLayers(syncLayersFromCanvas(fabricCanvas))
  }, [getObj, fabricCanvas, pushHistory, setLayers])

  const handleFontFamily = async (family: string | null) => {
    if (!family) return
    setFontFamily(family)
    await loadFont(family)
    applyProp({ fontFamily: family })
  }

  const handleFontSize = (val: number | readonly number[]) => {
    const size = Array.isArray(val) ? (val as number[])[0] : (val as number)
    setFontSize(size)
    const scale = fabricCanvas?._scale ?? 1
    applyProp({ fontSize: size * scale })
  }

  const handleFill = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFill(e.target.value)
    applyProp({ fill: e.target.value })
  }

  const handleAlign = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align)
    applyProp({ textAlign: align })
  }

  const handleBold = () => {
    const next = !bold
    setBold(next)
    applyProp({ fontWeight: next ? 700 : 400 })
  }

  const handleItalic = () => {
    const next = !italic
    setItalic(next)
    applyProp({ fontStyle: next ? 'italic' : 'normal' })
  }

  const handleUnderline = () => {
    const next = !underline
    setUnderline(next)
    applyProp({ underline: next })
  }

  const handleLineHeight = (val: number | readonly number[]) => {
    const n = Array.isArray(val) ? (val as number[])[0] : (val as number)
    setLineHeight(n)
    applyProp({ lineHeight: n })
  }

  const handleCharSpacing = (val: number | readonly number[]) => {
    const n = Array.isArray(val) ? (val as number[])[0] : (val as number)
    setCharSpacing(n)
    applyProp({ charSpacing: n })
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs text-gray-500 mb-2 block">字体</Label>
        <Select value={fontFamily} onValueChange={handleFontFamily}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {['serif', 'sans-serif', 'handwriting', 'display', 'monospace'].map((cat) => (
              <div key={cat}>
                <div className="px-2 py-1 text-xs text-gray-400 uppercase tracking-wider font-medium">
                  {cat === 'serif' ? '衬线' : cat === 'sans-serif' ? '无衬线' : cat === 'handwriting' ? '手写' : cat === 'display' ? '展示' : '等宽'}
                </div>
                {CURATED_FONTS.filter((f) => f.category === cat).map((f) => (
                  <SelectItem key={f.id} value={f.family} className="text-sm" style={{ fontFamily: f.family }}>
                    {f.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-500">字号</Label>
          <span className="text-xs font-mono text-gray-700">{fontSize}px</span>
        </div>
        <Slider min={12} max={300} step={1} value={[fontSize]} onValueChange={handleFontSize} />
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">样式</Label>
        <div className="flex gap-1">
          <Button variant={bold ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={handleBold}><Bold size={14} /></Button>
          <Button variant={italic ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={handleItalic}><Italic size={14} /></Button>
          <Button variant={underline ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={handleUnderline}><Underline size={14} /></Button>
          <div className="ml-auto flex gap-1">
            <Button variant={textAlign === 'left' ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => handleAlign('left')}><AlignLeft size={14} /></Button>
            <Button variant={textAlign === 'center' ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => handleAlign('center')}><AlignCenter size={14} /></Button>
            <Button variant={textAlign === 'right' ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => handleAlign('right')}><AlignRight size={14} /></Button>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2 block">颜色</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={fill} onChange={handleFill} className="h-9 w-14 rounded border border-gray-200 cursor-pointer p-0.5" />
          <span className="text-sm font-mono text-gray-700">{fill.toUpperCase()}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-500">行间距</Label>
          <span className="text-xs font-mono text-gray-700">{lineHeight.toFixed(1)}</span>
        </div>
        <Slider min={0.8} max={3} step={0.05} value={[lineHeight]} onValueChange={handleLineHeight} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-500">字间距</Label>
          <span className="text-xs font-mono text-gray-700">{charSpacing}</span>
        </div>
        <Slider min={-100} max={800} step={10} value={[charSpacing]} onValueChange={handleCharSpacing} />
      </div>
    </div>
  )
}
