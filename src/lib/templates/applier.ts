import type { Template } from '@/types/template'
import { createTextLayer, createRectLayer, createCircleLayer } from '@/lib/fabric/object-factory'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function applyTemplate(canvas: any, template: Template): Promise<void> {
  canvas.clear()

  const scale = canvas._scale as number

  for (const layerDef of template.layers) {
    const props = layerDef.fabricProps as Record<string, any>

    if (layerDef.type === 'background') {
      canvas.set('backgroundColor', props.fill ?? '#FFFFFF')
      if (props.left !== undefined) {
        // Named background shape (e.g., split background)
        const rect = await createRectLayer({
          shapeType: 'rect',
          left: (props.left ?? 0) * scale,
          top: (props.top ?? 0) * scale,
          width: (props.width ?? 1080) * scale,
          height: (props.height ?? 1080) * scale,
          fill: props.fill,
        })
        ;(rect as any).selectable = false
        ;(rect as any).evented = false
        ;(rect as any).layerName = layerDef.label
        canvas.add(rect)
      }
    } else if (layerDef.type === 'text') {
      const obj = await createTextLayer({
        text: layerDef.defaultText ?? '',
        fontFamily: props.fontFamily,
        fontSize: props.fontSize ? Math.round(props.fontSize * scale) : undefined,
        fontWeight: props.fontWeight,
        fill: props.fill,
        textAlign: props.textAlign,
        left: props.left !== undefined ? props.left * scale : undefined,
        top: props.top !== undefined ? props.top * scale : undefined,
        width: props.width !== undefined ? props.width * scale : undefined,
        lineHeight: props.lineHeight,
        charSpacing: props.charSpacing,
        italic: props.fontStyle === 'italic',
      })
      ;(obj as any).layerName = layerDef.label
      canvas.add(obj)
    } else if (layerDef.type === 'shape') {
      const hasRadius = 'radius' in props
      if (hasRadius) {
        const obj = await createCircleLayer({
          shapeType: 'circle',
          left: (props.left ?? 0) * scale,
          top: (props.top ?? 0) * scale,
          width: (props.radius ?? 100) * 2 * scale,
          height: (props.radius ?? 100) * 2 * scale,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth ? props.strokeWidth * scale : 0,
        })
        ;(obj as any).opacity = props.opacity ?? 1
        ;(obj as any).layerName = layerDef.label
        canvas.add(obj)
      } else {
        const obj = await createRectLayer({
          shapeType: 'rect',
          left: (props.left ?? 0) * scale,
          top: (props.top ?? 0) * scale,
          width: (props.width ?? 200) * scale,
          height: (props.height ?? 200) * scale,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth ? props.strokeWidth * scale : 0,
          rx: props.rx ? props.rx * scale : 0,
          ry: props.ry ? props.ry * scale : 0,
        })
        ;(obj as any).layerName = layerDef.label
        canvas.add(obj)
      }
    } else if (layerDef.type === 'image-placeholder') {
      // Create a placeholder rect
      const obj = await createRectLayer({
        shapeType: 'rect',
        left: (props.left ?? 0) * scale,
        top: (props.top ?? 0) * scale,
        width: (props.width ?? 400) * scale,
        height: (props.height ?? 400) * scale,
        fill: '#E8E8E8',
        rx: 0,
      })
      ;(obj as any).layerName = layerDef.label
      ;(obj as any).layerType = 'image-placeholder'
      canvas.add(obj)
    }
  }

  canvas.requestRenderAll()
}
