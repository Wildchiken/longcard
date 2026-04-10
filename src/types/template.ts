import type { ZineFormat } from './zine'

export type TemplateCategory =
  | 'single-column'
  | 'split'
  | 'collage'
  | 'quote-card'
  | 'journal'
  | 'magazine-cover'
  | 'polaroid'
  | 'risograph'
  | 'minimal'

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  'single-column': '单栏排版',
  'split': '左右分栏',
  'collage': '拼贴相册',
  'quote-card': '引用卡片',
  'journal': '手账日记',
  'magazine-cover': '杂志封面',
  'polaroid': '宝丽来',
  'risograph': 'Risograph',
  'minimal': '极简风格',
}

export interface TemplateLayerDef {
  type: 'text' | 'image-placeholder' | 'decoration' | 'shape' | 'background'
  id: string
  label: string
  fabricProps: Record<string, unknown>
  defaultText?: string
  aspectRatio?: number
  decorationId?: string
}

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  format: ZineFormat
  themeId: string
  thumbnailColor: string
  layers: TemplateLayerDef[]
  tags: string[]
}
