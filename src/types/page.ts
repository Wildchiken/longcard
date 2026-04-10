import type { LayoutOverrides } from '@/lib/page/layout-presets'

export type BlockType =
  | 'title'
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'tag'
  | 'list'

export interface BlockStyle {
  fontFamily?: string
  fontSize?: number
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  bold?: boolean
  italic?: boolean
  lineHeight?: number
  charSpacing?: number
}

export interface Block {
  id: string
  type: BlockType
  content: string          // text content (empty for image/divider/spacer)
  style?: BlockStyle
  imageUrl?: string        // base64 data URL for image blocks
  imageAlt?: string
  imageCaption?: string
  /** For list blocks: items separated by \n */
  listItems?: string[]
  /** For list blocks: 'ul' = unordered, 'ol' = ordered */
  listOrdered?: boolean
}

export interface PageTheme {
  id: string
  background: string
  surface: string
  text: string
  textMuted: string
  accent: string
  fontHeading: string
  fontBody: string
  maxWidth: number          // logical px, e.g. 750
  paddingX: number
  paddingY: number
}

export const PAGE_THEMES: PageTheme[] = [
  {
    id: 'page-clean',
    background: '#FAFAF7',
    surface: '#F2F1EB',
    text: '#1A1714',
    textMuted: '#8A8070',
    accent: '#A07830',
    fontHeading: 'Playfair Display',
    fontBody: 'DM Sans',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
  /** 高白底、中性色与清晰无衬线，偏系统浅色阅读感 */
  {
    id: 'page-paper',
    background: '#FFFFFF',
    surface: '#F5F5F7',
    text: '#1D1D1F',
    textMuted: '#6E6E73',
    accent: '#0A84FF',
    fontHeading: 'Plus Jakarta Sans',
    fontBody: 'Inter',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
  {
    id: 'page-dark-academia',
    background: '#1C1914',
    surface: '#2A2520',
    text: '#EDE0CC',
    textMuted: '#9A8468',
    accent: '#D4B896',
    fontHeading: 'EB Garamond',
    fontBody: 'Lora',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
  {
    id: 'page-journal',
    background: '#F7F3ED',
    surface: '#EDE8D8',
    text: '#3D3426',
    textMuted: '#8B7D5E',
    accent: '#5C3D1E',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Lora',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
  {
    id: 'page-minimal-gray',
    background: '#F2F2F2',
    surface: '#E8E8E8',
    text: '#1A1A1A',
    textMuted: '#777777',
    accent: '#000000',
    fontHeading: 'Josefin Sans',
    fontBody: 'Inter',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
  {
    id: 'page-coffee',
    background: '#F4ECD8',
    surface: '#E8D8B8',
    text: '#2C1A08',
    textMuted: '#8B6B4A',
    accent: '#5C3D1E',
    fontHeading: 'Playfair Display',
    fontBody: 'Lora',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
  {
    id: 'page-matcha',
    background: '#F0F4EF',
    surface: '#E2EAE0',
    text: '#1E3A2B',
    textMuted: '#6A9075',
    accent: '#4A7C59',
    fontHeading: 'DM Sans',
    fontBody: 'Inter',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
  {
    id: 'page-lavender',
    background: '#F5F0FF',
    surface: '#EBE0FF',
    text: '#2A1A4A',
    textMuted: '#8B70B0',
    accent: '#7B5EA7',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'DM Sans',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
  {
    id: 'page-midnight',
    background: '#0A0E1A',
    surface: '#141929',
    text: '#E8EDF8',
    textMuted: '#6B7A9A',
    accent: '#7B9FE0',
    fontHeading: 'Bebas Neue',
    fontBody: 'DM Sans',
    maxWidth: 750,
    paddingX: 48,
    paddingY: 60,
  },
]

export interface ZinePage {
  id: string
  title: string
  blocks: Block[]
  themeId: string
  thumbnailDataURL: string
  tags: string[]
  collectionId: string | null
  createdAt: number
  updatedAt: number
  schemaVersion: number
  sourceText?: string
  layoutPresetId?: string
  layoutOverrides?: LayoutOverrides
  markdownEnabled?: boolean
  imageBlocks?: Array<Block & { insertAfterIndex: number }>
}

export function getPageTheme(id: string): PageTheme {
  return PAGE_THEMES.find((t) => t.id === id) ?? PAGE_THEMES[0]
}
