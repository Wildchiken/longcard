import { Suspense } from 'react'
import { ComposeWorkbench } from '@/components/compose/ComposeWorkbench'

export const metadata = {
  title: 'Longcard — 文字转长图',
}

export default function ComposePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    }>
      <ComposeWorkbench />
    </Suspense>
  )
}
