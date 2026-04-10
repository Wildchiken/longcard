import { create } from 'zustand'
import type { LayerMeta, LayerType } from '@/types/layer'
import type { ZineFormat } from '@/types/zine'

type ActiveTool = 'select' | 'text' | 'image' | 'decoration' | 'shape' | 'pan'
type ActivePanel = 'layers' | 'templates' | 'theme' | 'export' | 'background' | null

interface EditorStore {
  // Canvas ref (stored as any to avoid SSR issues with Fabric types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fabricCanvas: any | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFabricCanvas: (c: any | null) => void

  zineId: string | null
  zineFormat: ZineFormat
  isDirty: boolean
  themeId: string
  activeObjectId: string | null
  activeObjectType: LayerType | null
  layers: LayerMeta[]
  historyStack: string[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  activeTool: ActiveTool
  activePanel: ActivePanel
  propertiesPanelOpen: boolean
  mobileSheetOpen: boolean

  setZineId: (id: string | null) => void
  setZineFormat: (f: ZineFormat) => void
  setThemeId: (id: string) => void
  setDirty: (v: boolean) => void
  setActiveObject: (id: string | null, type: LayerType | null) => void
  setLayers: (layers: LayerMeta[]) => void
  setActiveTool: (t: ActiveTool) => void
  setActivePanel: (p: ActivePanel) => void
  setPropertiesPanelOpen: (v: boolean) => void
  setMobileSheetOpen: (v: boolean) => void

  pushHistory: (json: string) => void
  undo: () => string | null
  redo: () => string | null
  markClean: () => void
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  fabricCanvas: null,
  setFabricCanvas: (c) => set({ fabricCanvas: c }),

  zineId: null,
  zineFormat: 'square',
  isDirty: false,
  themeId: 'minimal-white',

  activeObjectId: null,
  activeObjectType: null,

  layers: [],

  historyStack: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  activeTool: 'select',
  activePanel: null,
  propertiesPanelOpen: false,
  mobileSheetOpen: false,

  setZineId: (id) => set({ zineId: id }),
  setZineFormat: (f) => set({ zineFormat: f }),
  setThemeId: (id) => set({ themeId: id }),
  setDirty: (v) => set({ isDirty: v }),

  setActiveObject: (id, type) => set({
    activeObjectId: id,
    activeObjectType: type,
    propertiesPanelOpen: id !== null,
  }),

  setLayers: (layers) => set({ layers }),
  setActiveTool: (t) => set({ activeTool: t }),
  setActivePanel: (p) => set({ activePanel: p }),
  setPropertiesPanelOpen: (v) => set({ propertiesPanelOpen: v }),
  setMobileSheetOpen: (v) => set({ mobileSheetOpen: v }),

  pushHistory: (json) => {
    const { historyStack, historyIndex } = get()
    const newStack = historyStack.slice(0, historyIndex + 1)
    newStack.push(json)
    const capped = newStack.slice(-50)
    set({
      historyStack: capped,
      historyIndex: capped.length - 1,
      canUndo: capped.length > 1,
      canRedo: false,
      isDirty: true,
    })
  },

  undo: () => {
    const { historyStack, historyIndex } = get()
    if (historyIndex <= 0) return null
    const newIndex = historyIndex - 1
    set({
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
    })
    return historyStack[newIndex]
  },

  redo: () => {
    const { historyStack, historyIndex } = get()
    if (historyIndex >= historyStack.length - 1) return null
    const newIndex = historyIndex + 1
    set({
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < historyStack.length - 1,
    })
    return historyStack[newIndex]
  },

  markClean: () => set({ isDirty: false }),
}))
