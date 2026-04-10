'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    window.location.replace('/compose')
  }, [])
  return (
    <div className="h-[100dvh] flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-gray-800 dark:border-t-gray-200 rounded-full animate-spin" />
    </div>
  )
}
