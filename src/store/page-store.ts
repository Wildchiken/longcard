import { create } from 'zustand'
import type { Block, ZinePage, PageTheme } from '@/types/page'
import { PAGE_THEMES, getPageTheme } from '@/types/page'
import { savePage, getAllPages, deletePage } from '@/lib/db/queries'
import { v4 as uuid } from 'uuid'

interface PageStore {
  pageId: string | null
  blocks: Block[]
  themeId: string
  pageTitle: string
  isDirty: boolean
  selectedBlockId: string | null
  pages: ZinePage[]

  initPage: (id: string, existing?: ZinePage | null) => void
  setThemeId: (id: string) => void
  setPageTitle: (t: string) => void
  selectBlock: (id: string | null) => void
  addBlock: (type: Block['type'], afterId?: string) => void
  updateBlock: (id: string, patch: Partial<Block>) => void
  deleteBlock: (id: string) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  saveCurrent: (thumbnailDataURL?: string) => Promise<void>
  loadPages: () => Promise<void>
  deleteSavedPage: (id: string) => Promise<void>
  markClean: () => void
}

function defaultBlock(type: Block['type']): Block {
  const id = uuid()
  switch (type) {
    case 'title':
      return { id, type, content: '标题', style: { fontSize: 40, bold: true, textAlign: 'center' } }
    case 'heading':
      return { id, type, content: '小标题', style: { fontSize: 26, bold: true } }
    case 'paragraph':
      return { id, type, content: '在这里写下你的文字...', style: { fontSize: 16, lineHeight: 1.8 } }
    case 'quote':
      return { id, type, content: '这里是引用内容', style: { fontSize: 18, italic: true, textAlign: 'center' } }
    case 'image':
      return { id, type, content: '', imageUrl: '', imageCaption: '' }
    case 'divider':
      return { id, type, content: '' }
    case 'spacer':
      return { id, type, content: '' }
    case 'tag':
      return { id, type, content: '标签' }
    default:
      return { id, type, content: '' }
  }
}

export const usePageStore = create<PageStore>((set, get) => ({
  pageId: null,
  blocks: [],
  themeId: 'page-clean',
  pageTitle: '未命名页面',
  isDirty: false,
  selectedBlockId: null,
  pages: [],

  initPage: (id, existing) => {
    if (existing) {
      set({
        pageId: id,
        blocks: existing.blocks,
        themeId: existing.themeId,
        pageTitle: existing.title,
        isDirty: false,
        selectedBlockId: null,
      })
    } else {
      set({
        pageId: id,
        blocks: [
          defaultBlock('title'),
          defaultBlock('paragraph'),
        ],
        themeId: 'page-clean',
        pageTitle: '未命名页面',
        isDirty: false,
        selectedBlockId: null,
      })
    }
  },

  setThemeId: (id) => set({ themeId: id, isDirty: true }),
  setPageTitle: (t) => set({ pageTitle: t, isDirty: true }),
  selectBlock: (id) => set({ selectedBlockId: id }),

  addBlock: (type, afterId) => {
    const block = defaultBlock(type)
    set((s) => {
      const blocks = [...s.blocks]
      if (afterId) {
        const idx = blocks.findIndex((b) => b.id === afterId)
        blocks.splice(idx + 1, 0, block)
      } else {
        blocks.push(block)
      }
      return { blocks, isDirty: true, selectedBlockId: block.id }
    })
  },

  updateBlock: (id, patch) => {
    set((s) => ({
      blocks: s.blocks.map((b) => b.id === id ? { ...b, ...patch } : b),
      isDirty: true,
    }))
  },

  deleteBlock: (id) => {
    set((s) => ({
      blocks: s.blocks.filter((b) => b.id !== id),
      selectedBlockId: s.selectedBlockId === id ? null : s.selectedBlockId,
      isDirty: true,
    }))
  },

  moveBlock: (from, to) => {
    set((s) => {
      const blocks = [...s.blocks]
      const [moved] = blocks.splice(from, 1)
      blocks.splice(to, 0, moved)
      return { blocks, isDirty: true }
    })
  },

  saveCurrent: async (thumbnailDataURL = '') => {
    const { pageId, blocks, themeId, pageTitle } = get()
    if (!pageId) return
    const page: ZinePage = {
      id: pageId,
      title: pageTitle,
      blocks,
      themeId,
      thumbnailDataURL,
      tags: [],
      collectionId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      schemaVersion: 1,
    }
    await savePage(page)
    set({ isDirty: false })
  },

  loadPages: async () => {
    const pages = await getAllPages()
    set({ pages })
  },

  deleteSavedPage: async (id) => {
    await deletePage(id)
    set((s) => ({ pages: s.pages.filter((p) => p.id !== id) }))
  },

  markClean: () => set({ isDirty: false }),
}))
