'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditorLayout } from '@/components/canvas/EditorLayout'

export default function NewEditorPage() {
  const router = useRouter()
  const [zineId, setZineId] = useState<string | null>(null)

  useEffect(() => {
    import('uuid').then(({ v4: uuid }) => {
      const id = uuid()
      setZineId(id)
      // Update URL without navigation
      window.history.replaceState(null, '', `/editor/${id}`)
    })
  }, [])

  if (!zineId) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
    </div>
  )

  return <EditorLayout zineId={zineId} format="square" />
}
