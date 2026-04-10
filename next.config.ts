import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Silence turbopack/webpack coexistence warning
  turbopack: {},
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Fabric.js requires canvas which is a native module — exclude from server bundle
  serverExternalPackages: ['canvas', 'fabric'],
}

export default nextConfig
