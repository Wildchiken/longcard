import Dexie, { type EntityTable } from 'dexie'
import type { Zine, Collection } from '@/types/zine'
import type { ZinePage } from '@/types/page'
import type { LayoutOverrides } from '@/lib/page/layout-presets'

export interface DbCustomFont {
  id: string
  name: string
  dataUrl: string
  createdAt: number
}

export interface PageVersion {
  id: string
  pageId: string
  title: string
  snapshot: ZinePage
  note?: string
  createdAt: number
}

export interface UserTemplate {
  id: string
  name: string
  presetId: string
  overrides: LayoutOverrides
  createdAt: number
}

class ZineDatabase extends Dexie {
  zines!: EntityTable<Zine, 'id'>
  pages!: EntityTable<ZinePage, 'id'>
  collections!: EntityTable<Collection, 'id'>
  fonts!: EntityTable<DbCustomFont, 'id'>
  pageVersions!: EntityTable<PageVersion, 'id'>
  userTemplates!: EntityTable<UserTemplate, 'id'>

  constructor() {
    super('ZineStudio')
    this.version(1).stores({
      zines: 'id, title, collectionId, createdAt, updatedAt, *tags',
      collections: 'id, name, createdAt',
    })
    this.version(2).stores({
      zines: 'id, title, collectionId, createdAt, updatedAt, *tags',
      pages: 'id, title, collectionId, createdAt, updatedAt, *tags',
      collections: 'id, name, createdAt',
    })
    this.version(3).stores({
      zines: 'id, title, collectionId, createdAt, updatedAt, *tags',
      pages: 'id, title, collectionId, createdAt, updatedAt, *tags, layoutPresetId',
      collections: 'id, name, createdAt',
    })
    this.version(4).stores({
      zines: 'id, title, collectionId, createdAt, updatedAt, *tags',
      pages: 'id, title, collectionId, createdAt, updatedAt, *tags, layoutPresetId',
      collections: 'id, name, createdAt',
      fonts: 'id, name, createdAt',
      pageVersions: 'id, pageId, createdAt',
    })
    this.version(5).stores({
      zines: 'id, title, collectionId, createdAt, updatedAt, *tags',
      pages: 'id, title, collectionId, createdAt, updatedAt, *tags, layoutPresetId',
      collections: 'id, name, createdAt',
      fonts: 'id, name, createdAt',
      pageVersions: 'id, pageId, createdAt',
      userTemplates: 'id, name, createdAt',
    })
  }
}

export const db = new ZineDatabase()
