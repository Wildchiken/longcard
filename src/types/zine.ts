export type ZineFormat = 'square' | 'portrait' | 'landscape' | 'story'

export interface ZineDimensions {
  width: number
  height: number
}

export const FORMAT_DIMENSIONS: Record<ZineFormat, ZineDimensions> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1350, height: 1080 },
  story: { width: 1080, height: 1920 },
}

export const FORMAT_LABELS: Record<ZineFormat, string> = {
  square: '正方形 1:1',
  portrait: '竖版 4:5',
  landscape: '横版 5:4',
  story: '故事 9:16',
}

export interface Zine {
  id: string
  title: string
  format: ZineFormat
  templateId: string | null
  themeId: string | null
  canvasJSON: string
  thumbnailDataURL: string
  tags: string[]
  collectionId: string | null
  createdAt: number
  updatedAt: number
  schemaVersion: number
}

export interface Collection {
  id: string
  name: string
  color: string
  createdAt: number
}
