'use client'

import { useState, useCallback } from 'react'
import { usePageStore } from '@/store/page-store'
import { shareImage, saveToDevice } from '@/lib/capacitor/share'
import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'

export function PageExportPanel({ pageRef }: { pageRef: React.RefObject<HTMLDivElement | null> }) {
  const [exporting, setExporting] = useState(false)
  const { pageTitle } = usePageStore()

  const captureAndExport = useCallback(async (action: 'download' | 'share') => {
    if (!pageRef.current) return
    setExporting(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataURL = await toPng(pageRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: undefined,
      })
      if (action === 'download') {
        const a = document.createElement('a')
        a.href = dataURL
        a.download = `${pageTitle}.png`
        a.click()
      } else {
        await shareImage(dataURL, pageTitle)
      }
    } finally {
      setExporting(false)
    }
  }, [pageRef, pageTitle])

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-gray-500 mb-4">
        将整个页面导出为一张长图，适合分享到各社交平台。
      </p>
      <Button
        className="w-full gap-2"
        onClick={() => captureAndExport('download')}
        disabled={exporting}
      >
        <Download size={16} />
        {exporting ? '生成中...' : '下载长图'}
      </Button>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => captureAndExport('share')}
        disabled={exporting}
      >
        <Share2 size={16} />
        分享图片
      </Button>
    </div>
  )
}
