'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FORMAT_LABELS, type ZineFormat } from '@/types/zine'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const FORMAT_ICONS: Record<ZineFormat, string> = {
  square: '⬜',
  portrait: '📱',
  landscape: '🖥',
  story: '📲',
}

const FORMAT_DESCRIPTIONS: Record<ZineFormat, string> = {
  square: '适合小红书、Instagram',
  portrait: '适合微信朋友圈',
  landscape: '适合横版海报',
  story: '适合抖音、微博故事',
}

interface NewZineDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function NewZineDialog({ open, onOpenChange }: NewZineDialogProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<ZineFormat>('square')

  const handleCreate = async () => {
    const { v4: uuid } = await import('uuid')
    const id = uuid()
    onOpenChange(false)
    router.push(`/editor?id=${encodeURIComponent(id)}&format=${selected}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="text-lg font-bold text-gray-900">选择画布格式</DialogTitle>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {(Object.keys(FORMAT_LABELS) as ZineFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelected(fmt)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                selected === fmt
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">{FORMAT_ICONS[fmt]}</div>
              <p className="font-semibold text-sm text-gray-900">{FORMAT_LABELS[fmt]}</p>
              <p className="text-xs text-gray-500 mt-0.5">{FORMAT_DESCRIPTIONS[fmt]}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button className="flex-1" onClick={handleCreate}>
            开始创作
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
