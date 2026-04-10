import { v4 as uuid } from 'uuid'

export interface TextLayerOptions {
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: number | string
  fill?: string
  textAlign?: string
  left?: number
  top?: number
  width?: number
  lineHeight?: number
  charSpacing?: number
  italic?: boolean
  underline?: boolean
}

export interface ImageLayerOptions {
  src: string
  left?: number
  top?: number
  scaleX?: number
  scaleY?: number
  width?: number
  height?: number
}

export interface ShapeLayerOptions {
  shapeType: 'rect' | 'circle' | 'line'
  left?: number
  top?: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  rx?: number
  ry?: number
}

export async function createTextLayer(opts: TextLayerOptions = {}) {
  const { IText } = await import('fabric')
  const obj = new IText(opts.text ?? '点击输入文字', {
    left: opts.left ?? 100,
    top: opts.top ?? 100,
    fontFamily: opts.fontFamily ?? 'Inter',
    fontSize: opts.fontSize ?? 48,
    fontWeight: opts.fontWeight ?? 400,
    fill: opts.fill ?? '#1A1A1A',
    textAlign: (opts.textAlign as any) ?? 'left',
    lineHeight: opts.lineHeight ?? 1.4,
    charSpacing: opts.charSpacing ?? 0,
    fontStyle: opts.italic ? 'italic' : 'normal',
    underline: opts.underline ?? false,
    width: opts.width ?? 400,
    splitByGrapheme: true,
  })

  ;(obj as any).id = uuid()
  ;(obj as any).layerName = '文字'
  ;(obj as any).locked = false
  ;(obj as any).layerType = 'text'

  return obj
}

export async function createImageLayer(opts: ImageLayerOptions) {
  const { FabricImage } = await import('fabric')

  return new Promise<InstanceType<typeof FabricImage>>((resolve, reject) => {
    FabricImage.fromURL(opts.src, { crossOrigin: 'anonymous' })
      .then((img) => {
        img.set({
          left: opts.left ?? 50,
          top: opts.top ?? 50,
        })

        if (opts.scaleX !== undefined) img.set({ scaleX: opts.scaleX })
        if (opts.scaleY !== undefined) img.set({ scaleY: opts.scaleY })

        ;(img as any).id = uuid()
        ;(img as any).layerName = '图片'
        ;(img as any).locked = false
        ;(img as any).layerType = 'image'

        resolve(img)
      })
      .catch(reject)
  })
}

export async function createRectLayer(opts: ShapeLayerOptions) {
  const { Rect } = await import('fabric')
  const obj = new Rect({
    left: opts.left ?? 100,
    top: opts.top ?? 100,
    width: opts.width ?? 200,
    height: opts.height ?? 200,
    fill: opts.fill ?? '#E5E5E5',
    stroke: opts.stroke ?? 'transparent',
    strokeWidth: opts.strokeWidth ?? 0,
    rx: opts.rx ?? 0,
    ry: opts.ry ?? 0,
  })

  ;(obj as any).id = uuid()
  ;(obj as any).layerName = '矩形'
  ;(obj as any).locked = false
  ;(obj as any).layerType = 'shape'

  return obj
}

export async function createCircleLayer(opts: ShapeLayerOptions) {
  const { Circle } = await import('fabric')
  const radius = Math.min(opts.width ?? 100, opts.height ?? 100) / 2
  const obj = new Circle({
    left: opts.left ?? 100,
    top: opts.top ?? 100,
    radius,
    fill: opts.fill ?? '#E5E5E5',
    stroke: opts.stroke ?? 'transparent',
    strokeWidth: opts.strokeWidth ?? 0,
  })

  ;(obj as any).id = uuid()
  ;(obj as any).layerName = '圆形'
  ;(obj as any).locked = false
  ;(obj as any).layerType = 'shape'

  return obj
}

export async function createSVGLayer(svgString: string, opts: { left?: number; top?: number; scale?: number } = {}) {
  const { loadSVGFromString, util } = await import('fabric')

  const { objects, options } = await loadSVGFromString(svgString)
  const group = util.groupSVGElements(objects.filter(Boolean) as any[], options)

  group.set({
    left: opts.left ?? 100,
    top: opts.top ?? 100,
  })

  if (opts.scale) {
    group.scale(opts.scale)
  }

  ;(group as any).id = uuid()
  ;(group as any).layerName = '装饰'
  ;(group as any).locked = false
  ;(group as any).layerType = 'decoration'

  return group
}
