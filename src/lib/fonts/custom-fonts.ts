'use client'

import { listDbFonts, saveDbFont, deleteDbFont } from '@/lib/db/queries'
import type { DbCustomFont } from '@/lib/db/schema'

export type SavedCustomFont = DbCustomFont

const MAX_FONTS = 20
const MAX_FILE_MB = 12
const ALLOWED_EXTS = ['.ttf', '.otf', '.woff', '.woff2']

// ── Public API ──────────────────────────────────────────────────────────────

export async function listCustomFonts(): Promise<SavedCustomFont[]> {
  return listDbFonts()
}

export async function addCustomFont(file: File): Promise<SavedCustomFont> {
  validateFontFile(file)

  const dataUrl = await fileToDataUrl(file)
  const name = normalizeFontName(file.name)

  const font: SavedCustomFont = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    dataUrl,
    createdAt: Date.now(),
  }

  // Replace if same name already exists
  const existing = await listDbFonts()
  const duplicate = existing.find((f) => f.name === name)
  if (duplicate) await deleteDbFont(duplicate.id)

  // Enforce limit
  if (existing.length >= MAX_FONTS && !duplicate) {
    throw new Error(`最多支持 ${MAX_FONTS} 个自定义字体`)
  }

  await saveDbFont(font)
  await loadFontFace(font)
  return font
}

export async function removeCustomFont(id: string): Promise<void> {
  await deleteDbFont(id)
}

export async function loadAllCustomFonts(): Promise<SavedCustomFont[]> {
  const fonts = await listDbFonts()
  await Promise.all(fonts.map((f) => loadFontFace(f)))
  return fonts
}

// ── Internal helpers ─────────────────────────────────────────────────────────

async function loadFontFace(font: SavedCustomFont) {
  if (typeof document === 'undefined' || !('fonts' in document)) return
  // Avoid double-loading the same family
  for (const face of document.fonts) {
    if (face.family === font.name && face.status === 'loaded') return
  }
  try {
    const ff = new FontFace(font.name, `url(${font.dataUrl})`)
    await ff.load()
    document.fonts.add(ff)
  } catch {
    // Ignore malformed font files
  }
}

function validateFontFile(file: File) {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTS.includes(ext)) {
    throw new Error(`不支持的字体格式：${ext}。支持的格式：${ALLOWED_EXTS.join(', ')}`)
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`字体文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），最大支持 ${MAX_FILE_MB}MB`)
  }
}

function normalizeFontName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'Custom Font'
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
