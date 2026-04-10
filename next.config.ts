import type { NextConfig } from 'next'

const staticExport = process.env.STATIC_EXPORT === '1'

const nextConfig: NextConfig = {
  ...(staticExport ? { output: 'export' as const } : {}),
  turbopack: {},
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  serverExternalPackages: ['canvas', 'fabric'],
}

export default nextConfig
