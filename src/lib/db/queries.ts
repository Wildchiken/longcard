import { db } from './schema'
import type { Zine, Collection } from '@/types/zine'
import type { ZinePage } from '@/types/page'
import type { DbCustomFont, PageVersion, UserTemplate } from './schema'

export async function getAllZines(): Promise<Zine[]> {
  return db.zines.orderBy('updatedAt').reverse().toArray()
}

export async function getZineById(id: string): Promise<Zine | undefined> {
  return db.zines.get(id)
}

export async function saveZine(zine: Zine): Promise<void> {
  await db.zines.put(zine)
}

export async function deleteZine(id: string): Promise<void> {
  await db.zines.delete(id)
}

export async function getAllPages(): Promise<ZinePage[]> {
  return db.pages.orderBy('updatedAt').reverse().toArray()
}

export async function getPageById(id: string): Promise<ZinePage | undefined> {
  return db.pages.get(id)
}

export async function savePage(page: ZinePage): Promise<void> {
  await db.pages.put(page)
}

export async function deletePage(id: string): Promise<void> {
  await Promise.all([
    db.pages.delete(id),
    db.pageVersions.where('pageId').equals(id).delete(),
  ])
}

export async function getAllCollections(): Promise<Collection[]> {
  return db.collections.orderBy('createdAt').toArray()
}

export async function saveCollection(col: Collection): Promise<void> {
  await db.collections.put(col)
}

export async function deleteCollection(id: string): Promise<void> {
  await db.collections.delete(id)
}

export async function listDbFonts(): Promise<DbCustomFont[]> {
  return db.fonts.orderBy('createdAt').reverse().toArray()
}

export async function saveDbFont(font: DbCustomFont): Promise<void> {
  await db.fonts.put(font)
}

export async function deleteDbFont(id: string): Promise<void> {
  await db.fonts.delete(id)
}

export async function getDbFont(id: string): Promise<DbCustomFont | undefined> {
  return db.fonts.get(id)
}

export async function listPageVersions(pageId: string): Promise<PageVersion[]> {
  return db.pageVersions.where('pageId').equals(pageId).sortBy('createdAt')
    .then((rows) => rows.reverse().slice(0, 50))
}

export async function savePageVersion(version: PageVersion): Promise<void> {
  await db.pageVersions.put(version)
  const allVersions = await db.pageVersions
    .where('pageId').equals(version.pageId)
    .sortBy('createdAt')
  if (allVersions.length > 50) {
    const toDelete = allVersions.slice(0, allVersions.length - 50)
    await db.pageVersions.bulkDelete(toDelete.map((v) => v.id))
  }
}

export async function deletePageVersion(id: string): Promise<void> {
  await db.pageVersions.delete(id)
}

export async function deleteAllPageVersions(pageId: string): Promise<void> {
  await db.pageVersions.where('pageId').equals(pageId).delete()
}

export async function listUserTemplates(): Promise<UserTemplate[]> {
  return db.userTemplates.orderBy('createdAt').reverse().toArray()
}

export async function saveUserTemplate(t: UserTemplate): Promise<void> {
  await db.userTemplates.put(t)
}

export async function deleteUserTemplate(id: string): Promise<void> {
  await db.userTemplates.delete(id)
}
