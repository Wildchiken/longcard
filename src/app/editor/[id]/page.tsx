'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { getZineById } from '@/lib/db/queries'
import { EditorLayout } from '@/components/canvas/EditorLayout'
import type { Zine, ZineFormat } from '@/types/zine'

export default function EditZinePage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const formatParam = searchParams.get('format') as ZineFormat | null
  const [zine, setZine] = useState<Zine | null | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    getZineById(id).then((z) => setZine(z ?? null))
  }, [id])

  if (zine === undefined) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
    </div>
  )

  const format: ZineFormat = zine?.format ?? formatParam ?? 'square'

  return <EditorLayout zineId={id} initialZine={zine} format={format} />
}
