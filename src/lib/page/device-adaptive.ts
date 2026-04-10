import type { LayoutOverrides } from './layout-presets'

/**
 * One-shot layout suggestion from the browser viewport (CSS px).
 * Goal: long image logical width feels natural when viewed full-width on *this* device.
 * Does not auto-run on resize — user explicitly applies to avoid fighting manual tweaks.
 */
export function computeDeviceAdaptiveOverrides(viewportWidth: number): LayoutOverrides {
  const vw = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 390
  const gutter = vw < 480 ? 24 : vw < 900 ? 40 : 56
  const contentWidth = Math.round(Math.min(1200, Math.max(280, vw - gutter)))
  const paddingX = Math.round(Math.min(140, Math.max(8, contentWidth * 0.085)))
  const paddingY = Math.round(Math.min(200, Math.max(12, contentWidth * 0.11)))
  const titleGap = Math.round(Math.min(140, Math.max(8, contentWidth * 0.065)))
  return { contentWidth, paddingX, paddingY, titleGap }
}

export function readViewportWidth(): number {
  if (typeof window === 'undefined') return 390
  return window.visualViewport?.width ?? window.innerWidth
}
