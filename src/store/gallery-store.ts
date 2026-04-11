import { create } from 'zustand'
import type { Zine, Collection } from '@/types/zine'
import type { ZinePage } from '@/types/page'
import {
  getAllZines, getAllCollections, saveZine, deleteZine,
  saveCollection, deleteCollection,
  getAllPages, deletePage,
} from '@/lib/db/queries'

interface GalleryStore {
  zines: Zine[]
  pages: ZinePage[]
  collections: Collection[]
  activeCollectionId: string | null
  isLoading: boolean

  loadAll: () => Promise<void>
  upsertZine: (zine: Zine) => Promise<void>
  removeZine: (id: string) => Promise<void>
  removePage: (id: string) => Promise<void>
  upsertCollection: (col: Collection) => Promise<void>
  removeCollection: (id: string) => Promise<void>
  setActiveCollection: (id: string | null) => void
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  zines: [],
  pages: [],
  collections: [],
  activeCollectionId: null,
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true })
    try {
      const [zines, pages, collections] = await Promise.all([
        getAllZines(),
        getAllPages(),
        getAllCollections(),
      ])
      set({ zines, pages, collections, isLoading: false })
    } catch (e) {
      set({ zines: [], pages: [], collections: [], isLoading: false })
      throw e
    }
  },

  upsertZine: async (zine) => {
    await saveZine(zine)
    set((s) => {
      const exists = s.zines.some((z) => z.id === zine.id)
      const list = exists
        ? s.zines.map((z) => (z.id === zine.id ? zine : z))
        : [zine, ...s.zines]
      return { zines: list.sort((a, b) => b.updatedAt - a.updatedAt) }
    })
  },

  removeZine: async (id) => {
    await deleteZine(id)
    set({ zines: get().zines.filter((z) => z.id !== id) })
  },

  removePage: async (id) => {
    await deletePage(id)
    set({ pages: get().pages.filter((p) => p.id !== id) })
  },

  upsertCollection: async (col) => {
    await saveCollection(col)
    set((s) => {
      const exists = s.collections.some((c) => c.id === col.id)
      const list = exists
        ? s.collections.map((c) => (c.id === col.id ? col : c))
        : [...s.collections, col]
      return { collections: list.sort((a, b) => a.createdAt - b.createdAt) }
    })
  },

  removeCollection: async (id) => {
    await deleteCollection(id)
    set({ collections: get().collections.filter((c) => c.id !== id) })
  },

  setActiveCollection: (id) => set({ activeCollectionId: id }),
}))
