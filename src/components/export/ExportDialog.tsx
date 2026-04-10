'use client'

import { useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { exportCanvasToDataURL, downloadDataURL } from '@/lib/fabric/export'
import { shareImage, saveToDevice } from '@/lib/capacitor/share'
import { Button } from '@/components/ui/button'
import { Download, Share2, Smartphone } from 'lucide-react'

type Format = 'png' | 'jpeg'
type Scale = 1 | 2 | 3

const SCALE_LABELS: Record<Scale, string> = {
  1: '1× 标准 (1080px)',
  2: '2× 高清 (2160px)',
  3: '3× 超清 (3240px)',
}

export function ExportPanel() {
  const { fabricCanvas, zineId } = useEditorStore()
  const [format, setFormat] = useState<Format>('png')
  const [scale, setScale] = useState<Scale>(2)
  const [isExporting, setIsExporting] = useState(false)

  const getDataURL = useCallback(async () => {
    if (!fabricCanvas) return null
    setIsExporting(true)
    try {
      const dataURL = await exportCanvasToDataURL(fabricCanvas, { format, scale, quality: 0.95 })
      return dataURL
    } finally {
      setIsExporting(false)
    }
  }, [fabricCanvas, format, scale])

  const handleDownload = async () => {
    const dataURL = await getDataURL()
    if (!dataURL) return
    downloadDataURL(dataURL, `zine-${zineId ?? 'untitled'}`)
  }

  const handleShare = async () => {
    const dataURL = await getDataURL()
    if (!dataURL) return
    await shareImage(dataURL, `zine-${zineId ?? 'untitled'}`)
  }

  const handleSaveDevice = async () => {
    const dataURL = await getDataURL()
    if (!dataURL) return
    await saveToDevice(dataURL, `zine-${zineId ?? 'untitled'}`)
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <p className="text-xs text-gray-500 mb-3 font-medium">格式</p>
        <div className="grid grid-cols-2 gap-2">
          {(['png', 'jpeg'] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                format === f ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-3 font-medium">分辨率</p>
        <div className="space-y-2">
          {([1, 2, 3] as Scale[]).map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`w-full py-2 px-3 rounded-lg border text-sm text-left transition-all ${
                scale === s ? 'border-gray-900 bg-gray-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {SCALE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <Button
          className="w-full gap-2"
          onClick={handleDownload}
          disabled={isExporting}
        >
          <Download size={16} />
          {isExporting ? '导出中...' : '下载到本地'}
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleShare}
          disabled={isExporting}
        >
          <Share2 size={16} />
          分享图片
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleSaveDevice}
          disabled={isExporting}
        >
          <Smartphone size={16} />
          保存到相册
        </Button>
      </div>
    </div>
  )
}
