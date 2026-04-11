'use client'

import { Suspense, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useSearchParams } from 'next/navigation'
import { getZineById } from '@/lib/db/queries'
import { EditorLayout } from '@/components/canvas/EditorLayout'
import type { Zine, ZineFormat } from '@/types/zine'

const FORMATS: ZineFormat[] = ['square', 'portrait', 'landscape', 'story']

function parseFormat(v: string | null): ZineFormat | null {
  if (!v) return null
  return FORMATS.includes(v as ZineFormat) ? (v as ZineFormat) : null
}

function EditorInner() {
  const searchParams = useSearchParams()
  const idParam = searchParams.get('id')
  const formatParam = parseFormat(searchParams.get('format'))

  const [readyId, setReadyId] = useState<string | null>(null)
  const [zine, setZine] = useState<Zine | null | undefined>(undefined)

  useEffect(() => {
    if (idParam) {
      setReadyId(idParam)
      setZine(undefined)
      let cancelled = false
      void getZineById(idParam).then((z) => {
        if (!cancelled) setZine(z ?? null)
      })
      return () => {
        cancelled = true
      }
    }
    let cancelled = false
    const id = uuid()
    const fmt = formatParam ?? 'square'
    const qs = new URLSearchParams({ id })
    if (fmt !== 'square') qs.set('format', fmt)
    window.history.replaceState(null, '', `/editor?${qs.toString()}`)
    if (!cancelled) {
      setReadyId(id)
      setZine(null)
    }
    return () => {
      cancelled = true
    }
  }, [idParam, formatParam])

  if (readyId === null || zine === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  const format: ZineFormat = zine?.format ?? formatParam ?? 'square'

  return <EditorLayout zineId={readyId} initialZine={zine} format={format} />
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      }
    >
      <EditorInner />
    </Suspense>
  )
}
