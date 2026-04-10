import type { ZineFormat } from '@/types/zine'
import { FORMAT_DIMENSIONS } from '@/types/zine'

let fabricModule: typeof import('fabric') | null = null

async function getFabric() {
  if (!fabricModule) {
    fabricModule = await import('fabric')
  }
  return fabricModule
}

export async function createZineCanvas(
  el: HTMLCanvasElement,
  format: ZineFormat,
  containerWidth: number,
): Promise<InstanceType<typeof import('fabric').Canvas>> {
  const { Canvas, FabricObject } = await getFabric()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(FabricObject as any).customProperties = ['id', 'layerName', 'locked', 'decorationId', 'layerType']

  const { width, height } = FORMAT_DIMENSIONS[format]
  const scale = containerWidth / width

  const canvas = new Canvas(el, {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    backgroundColor: '#ffffff',
    preserveObjectStacking: true,
    selection: true,
    stopContextMenu: true,
    fireRightClick: true,
  })

  ;(canvas as any)._logicalWidth = width
  ;(canvas as any)._logicalHeight = height
  ;(canvas as any)._scale = scale

  canvas.setZoom(scale)
  canvas.setDimensions({
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  })

  return canvas
}

export async function resizeCanvas(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canvas: any,
  containerWidth: number,
) {
  const logicalWidth = canvas._logicalWidth as number
  const logicalHeight = canvas._logicalHeight as number
  const scale = containerWidth / logicalWidth

  canvas._scale = scale
  canvas.setZoom(scale)
  canvas.setDimensions({
    width: Math.round(logicalWidth * scale),
    height: Math.round(logicalHeight * scale),
  })
  canvas.requestRenderAll()
}
