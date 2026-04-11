import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { Block, PageTheme, ZinePage } from '@/types/page'
import { getPageTheme } from '@/types/page'
import { parseTextToBlocks } from '@/lib/page/autolayout'
import { getPreset, applyOverrides, LAYOUT_PRESETS } from '@/lib/page/layout-presets'
import type { LayoutPreset, LayoutOverrides } from '@/lib/page/layout-presets'
import { savePage, getPageById, savePageVersion, listUserTemplates, saveUserTemplate, deleteUserTemplate as deleteUserTemplateDb } from '@/lib/db/queries'
import type { SavedCustomFont } from '@/lib/fonts/custom-fonts'
import type { PageVersion, UserTemplate } from '@/lib/db/schema'

// ── Per-preset default overrides (persisted to localStorage) ─────────────────

const DEFAULT_OVERRIDES_KEY = 'zs_default_overrides'

function loadDefaultOverridesMap(): Record<string, LayoutOverrides> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(DEFAULT_OVERRIDES_KEY) ?? '{}')
  } catch { return {} }
}

function saveDefaultOverridesMap(map: Record<string, LayoutOverrides>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEFAULT_OVERRIDES_KEY, JSON.stringify(map))
}

// ── History snapshot ─────────────────────────────────────────────────────────

interface HistorySnapshot {
  sourceText: string
  presetId: string
  overrides: LayoutOverrides
  markdownEnabled: boolean
  pageTitle: string
}

const MAX_HISTORY = 80

let _loadPageSeq = 0
let _overrideTimer: ReturnType<typeof setTimeout> | null = null
let _textTimer: ReturnType<typeof setTimeout> | null = null

function clearDebounceTimers() {
  if (_overrideTimer) { clearTimeout(_overrideTimer); _overrideTimer = null }
  if (_textTimer) { clearTimeout(_textTimer); _textTimer = null }
}

interface ComposeStore {
  pageId: string
  pageTitle: string
  sourceText: string
  presetId: string
  overrides: LayoutOverrides
  blocks: Block[]
  imageBlocks: Array<Block & { insertAfterIndex: number }>
  isSaving: boolean
  savedAt: number | null
  isLoaded: boolean
  watermarkText: string
  exportScale: 2 | 3
  markdownEnabled: boolean
  exportFormat: 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf' | 'html' | 'markdown' | 'clipboard'
  imageWidthPreset: 'phone' | 'desktop' | 'custom'
  imageWidthCustom: number
  customFonts: SavedCustomFont[]
  userTemplates: UserTemplate[]

  history: HistorySnapshot[]
  historyIndex: number

  effectivePreset: () => LayoutPreset
  effectiveTheme: () => PageTheme
  canUndo: () => boolean
  canRedo: () => boolean

  setPageTitle: (t: string) => void
  setSourceText: (text: string) => void
  setPresetId: (id: string) => void
  setOverrides: (o: Partial<LayoutOverrides>) => void
  resetOverrides: () => void
  setWatermarkText: (text: string) => void
  setExportScale: (s: 2 | 3) => void
  setMarkdownEnabled: (enabled: boolean) => void
  setExportFormat: (format: 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf' | 'html' | 'markdown' | 'clipboard') => void
  setImageWidthPreset: (preset: 'phone' | 'desktop' | 'custom') => void
  setImageWidthCustom: (width: number) => void
  setCustomFonts: (fonts: SavedCustomFont[]) => void
  setUserTemplates: (templates: UserTemplate[]) => void
  loadUserTemplates: () => Promise<void>
  saveAsTemplate: (name: string) => Promise<void>
  deleteUserTemplate: (id: string) => Promise<void>
  loadUserTemplate: (t: UserTemplate) => void
  addImageBlock: (dataURL: string, insertAfterIndex: number, alt?: string, caption?: string) => void
  removeImageBlock: (id: string) => void
  setDefaultOverrides: (presetId: string, overrides: LayoutOverrides) => void
  clearDefaultOverrides: (presetId: string) => void
  resetPage: () => void
  /** `true` loaded, `false` missing/error, `null` superseded by a newer load */
  loadPage: (id: string) => Promise<boolean | null>
  saveToGallery: (
    thumbnailDataURL?: string
  ) => Promise<{ ok: true; pageId: string } | { ok: false; error: string }>

  commitHistory: () => void
  undo: () => void
  redo: () => void
}

const freshId = () => uuid()

function snapshotOf(s: ComposeStore): HistorySnapshot {
  return {
    sourceText: s.sourceText,
    presetId: s.presetId,
    overrides: { ...s.overrides },
    markdownEnabled: s.markdownEnabled,
    pageTitle: s.pageTitle,
  }
}

const _initPresetId = LAYOUT_PRESETS[0].id
const _initOverrides: LayoutOverrides = loadDefaultOverridesMap()[_initPresetId] ?? {}

const INITIAL_SNAPSHOT: HistorySnapshot = {
  sourceText: '',
  presetId: _initPresetId,
  overrides: _initOverrides,
  markdownEnabled: true,
  pageTitle: '',
}

export const useComposeStore = create<ComposeStore>((set, get) => ({
  pageId: freshId(),
  pageTitle: '',
  sourceText: '',
  presetId: _initPresetId,
  overrides: _initOverrides,
  blocks: [],
  imageBlocks: [],
  isSaving: false,
  savedAt: null,
  isLoaded: false,
  watermarkText: '',
  exportScale: 3,
  markdownEnabled: true,
  exportFormat: 'png',
  imageWidthPreset: 'phone',
  imageWidthCustom: 1080,
  customFonts: [],
  userTemplates: [],

  history: [INITIAL_SNAPSHOT],
  historyIndex: 0,

    effectivePreset: () => {
    const { presetId, overrides } = get()
    return applyOverrides(getPreset(presetId), overrides)
  },

  effectiveTheme: () => {
    const { presetId, overrides } = get()
    const base = getPageTheme(getPreset(presetId).themeId)
    return {
      ...base,
      background: overrides.backgroundColor ?? base.background,
      text:        overrides.textColor       ?? base.text,
      accent:      overrides.accentColor     ?? base.accent,
      fontHeading: overrides.fontHeading     ?? base.fontHeading,
      fontBody:    overrides.fontBody        ?? base.fontBody,
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },

  commitHistory: () => {
    const s = get()
    const snap = snapshotOf(s)
    const prev = s.history.slice(0, s.historyIndex + 1)
    const next = [...prev, snap].slice(-MAX_HISTORY)
    set({ history: next, historyIndex: next.length - 1 })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    const snap = history[newIndex]
    set({
      historyIndex: newIndex,
      sourceText: snap.sourceText,
      presetId: snap.presetId,
      overrides: snap.overrides,
      markdownEnabled: snap.markdownEnabled,
      pageTitle: snap.pageTitle,
      blocks: parseTextToBlocks(snap.sourceText, { markdownEnabled: snap.markdownEnabled }),
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    const snap = history[newIndex]
    set({
      historyIndex: newIndex,
      sourceText: snap.sourceText,
      presetId: snap.presetId,
      overrides: snap.overrides,
      markdownEnabled: snap.markdownEnabled,
      pageTitle: snap.pageTitle,
      blocks: parseTextToBlocks(snap.sourceText, { markdownEnabled: snap.markdownEnabled }),
    })
  },

  setPageTitle: (t) => set({ pageTitle: t }),

  setSourceText: (text) => {
    const markdownEnabled = get().markdownEnabled
    const blocks = parseTextToBlocks(text, { markdownEnabled })
    const titleBlock = blocks.find((b) => b.type === 'title')
    set((s) => ({
      sourceText: text,
      blocks,
      pageTitle: s.pageTitle || titleBlock?.content?.slice(0, 40) || '',
    }))
    // Debounce: commit history 600 ms after the last keystroke.
    if (_textTimer) clearTimeout(_textTimer)
    _textTimer = setTimeout(() => {
      get().commitHistory()
      _textTimer = null
    }, 600)
  },

  setPresetId: (id) => {
    // Always reset overrides when switching to a different preset,
    // applying any saved defaults for the new preset (or starting clean).
    const map = loadDefaultOverridesMap()
    const defaults = map[id]
    set({ presetId: id, overrides: defaults ? { ...defaults } : {} })
    get().commitHistory()
  },

  setOverrides: (o) => {
    set((s) => ({ overrides: { ...s.overrides, ...o } }))
    // Debounce: commit one history entry per slider-drag burst.
    if (_overrideTimer) clearTimeout(_overrideTimer)
    _overrideTimer = setTimeout(() => {
      get().commitHistory()
      _overrideTimer = null
    }, 800)
  },

  resetOverrides: () => {
    set({ overrides: {} })
    get().commitHistory()
  },

  setWatermarkText: (text) => set({ watermarkText: text }),
  setExportScale: (s) => set({ exportScale: s }),

  setMarkdownEnabled: (enabled) => {
    set((s) => ({
      markdownEnabled: enabled,
      blocks: parseTextToBlocks(s.sourceText, { markdownEnabled: enabled }),
    }))
    get().commitHistory()
  },

  setExportFormat: (format) => set({ exportFormat: format }),
  setImageWidthPreset: (preset) => set({ imageWidthPreset: preset }),
  setImageWidthCustom: (width) => set({ imageWidthCustom: Math.max(320, Math.min(4000, Math.round(width))) }),
  setCustomFonts: (fonts) => set({ customFonts: fonts }),
  setUserTemplates: (templates) => set({ userTemplates: templates }),

  loadUserTemplates: async () => {
    const templates = await listUserTemplates()
    set({ userTemplates: templates })
  },

  saveAsTemplate: async (name) => {
    const { presetId, overrides } = get()
    const t: UserTemplate = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim() || '我的模版',
      presetId,
      overrides: { ...overrides },
      createdAt: Date.now(),
    }
    await saveUserTemplate(t)
    set((s) => ({ userTemplates: [t, ...s.userTemplates] }))
  },

  deleteUserTemplate: async (id) => {
    await deleteUserTemplateDb(id)
    set((s) => ({ userTemplates: s.userTemplates.filter((t) => t.id !== id) }))
  },

  loadUserTemplate: (t) => {
    // Applying a template changes preset + overrides; record as one undoable action
    set({ presetId: t.presetId, overrides: { ...t.overrides } })
    get().commitHistory()
  },

  addImageBlock: (dataURL, insertAfterIndex, alt = '', caption = '') => {
    const block = {
      id: uuid(),
      type: 'image' as const,
      content: '',
      imageUrl: dataURL,
      imageAlt: alt,
      imageCaption: caption,
      style: {},
      insertAfterIndex,
    }
    set((s) => ({ imageBlocks: [...s.imageBlocks, block] }))
  },

  removeImageBlock: (id) => {
    set((s) => ({ imageBlocks: s.imageBlocks.filter((b) => b.id !== id) }))
  },

  setDefaultOverrides: (presetId, overrides) => {
    const map = loadDefaultOverridesMap()
    map[presetId] = { ...overrides }
    saveDefaultOverridesMap(map)
  },

  clearDefaultOverrides: (presetId) => {
    const map = loadDefaultOverridesMap()
    delete map[presetId]
    saveDefaultOverridesMap(map)
  },

  resetPage: () => {
    clearDebounceTimers()
    const initialPresetId = LAYOUT_PRESETS[0].id
    const savedDefaults = loadDefaultOverridesMap()[initialPresetId] ?? {}
    const initialSnap: HistorySnapshot = { ...INITIAL_SNAPSHOT, overrides: savedDefaults }
    set({
      pageId: freshId(),
      pageTitle: '',
      sourceText: '',
      blocks: [],
      imageBlocks: [],
      savedAt: null,
      isLoaded: false,
      overrides: savedDefaults,
      presetId: initialPresetId,
      watermarkText: '',
      markdownEnabled: true,
      exportFormat: 'png',
      imageWidthPreset: 'phone',
      imageWidthCustom: 1080,
      history: [initialSnap],
      historyIndex: 0,
    })
  },

  loadPage: async (id) => {
    const seq = ++_loadPageSeq
    clearDebounceTimers()
    try {
      const page = await getPageById(id)
      if (seq !== _loadPageSeq) return null
      if (!page) return false
      const markdownEnabled = page.markdownEnabled !== undefined ? page.markdownEnabled : true
      const sourceText = page.sourceText ?? ''
      const blocks = sourceText
        ? parseTextToBlocks(sourceText, { markdownEnabled })
        : page.blocks
      const restoredOverrides = (page.layoutOverrides ?? {}) as LayoutOverrides
      const restoredPresetId = page.layoutPresetId ?? LAYOUT_PRESETS[0].id
      const loadedSnap: HistorySnapshot = {
        sourceText,
        presetId: restoredPresetId,
        overrides: restoredOverrides,
        markdownEnabled,
        pageTitle: page.title,
      }
      if (seq !== _loadPageSeq) return null
      set({
        pageId: page.id,
        pageTitle: page.title,
        sourceText,
        blocks,
        imageBlocks: page.imageBlocks ?? [],
        presetId: restoredPresetId,
        overrides: restoredOverrides,
        markdownEnabled,
        savedAt: page.updatedAt,
        isLoaded: true,
        history: [loadedSnap],
        historyIndex: 0,
      })
      return true
    } catch {
      if (seq !== _loadPageSeq) return null
      return false
    }
  },

  saveToGallery: async (thumbnailDataURL = '') => {
    const { pageId, pageTitle, blocks, imageBlocks, presetId, overrides, sourceText, markdownEnabled } = get()
    set({ isSaving: true })
    try {
      const existing = await getPageById(pageId)
      const now = Date.now()
      const page: ZinePage = {
        id: pageId,
        title: pageTitle || '未命名',
        blocks,
        themeId: getPreset(presetId).themeId,
        thumbnailDataURL,
        tags: existing?.tags ?? [],
        collectionId: existing?.collectionId ?? null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        schemaVersion: existing?.schemaVersion ?? 1,
        sourceText,
        layoutPresetId: presetId,
        layoutOverrides: Object.keys(overrides).length > 0 ? overrides : undefined,
        markdownEnabled,
        imageBlocks: imageBlocks.length > 0 ? imageBlocks : undefined,
      }
      await savePage(page)

      const version: PageVersion = {
        id: uuid(),
        pageId,
        title: pageTitle || '未命名',
        snapshot: page,
        note: `手动保存 — ${new Date(now).toLocaleString('zh-CN')}`,
        createdAt: now,
      }
      await savePageVersion(version)

      set({ savedAt: now })
      return { ok: true as const, pageId }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false as const, error: msg || 'Unknown error' }
    } finally {
      set({ isSaving: false })
    }
  },
}))

export { getPageTheme, getPreset }
