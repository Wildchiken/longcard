export type LayerType = 'text' | 'image' | 'decoration' | 'shape' | 'group'

export interface BaseLayerMeta {
  fabricId: string
  type: LayerType
  name: string
  visible: boolean
  locked: boolean
  zIndex: number
}

export interface TextLayerMeta extends BaseLayerMeta {
  type: 'text'
  text: string
  fontFamily: string
}

export interface ImageLayerMeta extends BaseLayerMeta {
  type: 'image'
  src: string
  filterIds: string[]
}

export interface DecorationLayerMeta extends BaseLayerMeta {
  type: 'decoration'
  decorationId: string
  svgPath: string
}

export interface ShapeLayerMeta extends BaseLayerMeta {
  type: 'shape'
  shapeType: 'rect' | 'circle' | 'line'
}

export type LayerMeta =
  | TextLayerMeta
  | ImageLayerMeta
  | DecorationLayerMeta
  | ShapeLayerMeta
