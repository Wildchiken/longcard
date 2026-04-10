const MAX_CANVAS_EDGE = 16384
const SAFETY = 0.995

export function getCaptureNodeCssSize(el: HTMLElement): { width: number; height: number } {
  const win = el.ownerDocument.defaultView ?? window
  const s = win.getComputedStyle(el)
  const bw =
    (parseFloat(s.borderLeftWidth) || 0) + (parseFloat(s.borderRightWidth) || 0)
  const bh =
    (parseFloat(s.borderTopWidth) || 0) + (parseFloat(s.borderBottomWidth) || 0)
  return {
    width: el.clientWidth + bw,
    height: el.clientHeight + bh,
  }
}

export function clampCapturePixelRatio(
  widthCss: number,
  heightCss: number,
  exportScale: number,
): number {
  const w = Math.max(1, widthCss)
  const h = Math.max(1, heightCss)
  const dpr =
    typeof window !== 'undefined' && window.devicePixelRatio > 0
      ? window.devicePixelRatio
      : 1
  const desired = Math.max(exportScale, dpr)
  const maxR = Math.min((MAX_CANVAS_EDGE * SAFETY) / w, (MAX_CANVAS_EDGE * SAFETY) / h)
  const r = Math.min(desired, maxR)
  return Math.max(0.05, r)
}
