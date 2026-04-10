import path from 'path'
import type { NextConfig } from 'next'

const staticExport = process.env.STATIC_EXPORT === '1'

const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? []

const nextConfig: NextConfig = {
  ...(staticExport ? { output: 'export' as const } : {}),
  allowedDevOrigins: ['**.ts.net', ...extraDevOrigins],
  turbopack: {
    root: path.join(__dirname),
  },
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  serverExternalPackages: ['canvas', 'fabric'],
}

export default nextConfig
