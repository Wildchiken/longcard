type ExportFormat = 'png' | 'jpeg'
type ExportScale = 1 | 2 | 3

export interface ExportOptions {
  format: ExportFormat
  scale: ExportScale
  quality?: number
}

export async function exportCanvasToDataURL(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canvas: any,
  opts: ExportOptions,
): Promise<string> {
  const logicalWidth = canvas._logicalWidth as number
  const logicalHeight = canvas._logicalHeight as number
  const currentScale = canvas._scale as number

  canvas.setZoom(opts.scale)
  canvas.setDimensions({
    width: logicalWidth * opts.scale,
    height: logicalHeight * opts.scale,
  })

  canvas.requestRenderAll()

  const dataURL: string = canvas.toDataURL({
    format: opts.format,
    quality: opts.quality ?? 0.95,
    multiplier: 1,
  })

  canvas.setZoom(currentScale)
  canvas.setDimensions({
    width: Math.round(logicalWidth * currentScale),
    height: Math.round(logicalHeight * currentScale),
  })
  canvas.requestRenderAll()

  return dataURL
}

export async function exportCanvasToBlob(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canvas: any,
  opts: ExportOptions,
): Promise<Blob> {
  const dataURL = await exportCanvasToDataURL(canvas, opts)
  const res = await fetch(dataURL)
  return res.blob()
}

export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime })
}

export function downloadDataURL(dataURL: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataURL
  a.download = filename
  a.click()
}

export async function generateThumbnail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canvas: any,
): Promise<string> {
  return exportCanvasToDataURL(canvas, { format: 'jpeg', scale: 1, quality: 0.7 })
}
