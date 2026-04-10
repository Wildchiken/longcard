import type { Metadata, Viewport } from 'next'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Longcard — 文字转长图',
  description: '将文字转化为精美长图，支持多种排版风格，一键导出高清图片',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Longcard',
  },
  icons: {
    apple: '/icons/apple-touch-icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full min-h-[100dvh] font-sans overscroll-y-contain">
        <ServiceWorkerRegistrar />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
