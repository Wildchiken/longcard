const SCHEMA_VERSION = 1

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeCanvas(canvas: any): string {
  const json = canvas.toJSON([
    'id', 'layerName', 'locked', 'decorationId', 'layerType',
    'selectable', 'evented', 'hoverCursor',
  ])
  json._schemaVersion = SCHEMA_VERSION
  return JSON.stringify(json)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deserializeCanvas(canvas: any, jsonStr: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const json = JSON.parse(jsonStr)
      canvas.loadFromJSON(json).then(() => {
        canvas.requestRenderAll()
        resolve()
      }).catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function syncLayersFromCanvas(canvas: any) {
  const objects = canvas.getObjects()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return objects.map((obj: any, index: number) => ({
    fabricId: obj.id ?? `obj-${index}`,
    type: obj.layerType ?? 'shape',
    name: obj.layerName ?? `图层 ${index + 1}`,
    visible: obj.visible !== false,
    locked: obj.locked === true,
    zIndex: index,
    text: obj.text ?? '',
    fontFamily: obj.fontFamily ?? '',
    src: obj.getSrc?.() ?? '',
    filterIds: [],
    decorationId: obj.decorationId ?? '',
    svgPath: '',
    shapeType: 'rect' as const,
  }))
}
