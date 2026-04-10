import type { Metadata } from 'next'
import { GalleryShell } from '@/components/gallery/GalleryShell'

export const metadata: Metadata = {
  title: '作品库 — Longcard',
  description: '本地保存的长图作品',
}

export default function GalleryPage() {
  return <GalleryShell />
}
