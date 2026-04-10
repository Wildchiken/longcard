'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePageStore } from '@/store/page-store'
import type { Block, PageTheme } from '@/types/page'
import { GripVertical, Trash2, Plus, ImageIcon } from 'lucide-react'

interface BlockItemProps {
  block: Block
  theme: PageTheme
  isSelected: boolean
  onAddAfter: () => void
}

export function BlockItem({ block, theme, isSelected, onAddAfter }: BlockItemProps) {
  const { selectBlock, updateBlock, deleteBlock } = usePageStore()
  const textRef = useRef<HTMLDivElement>(null)

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  // Sync contenteditable → store
  const handleInput = useCallback(() => {
    if (!textRef.current) return
    updateBlock(block.id, { content: textRef.current.innerText })
  }, [block.id, updateBlock])

  // Keep DOM in sync when block content changes externally (e.g. init)
  useEffect(() => {
    if (textRef.current && textRef.current.innerText !== block.content) {
      textRef.current.innerText = block.content
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id]) // only on mount

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        updateBlock(block.id, { imageUrl: ev.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [block.id, updateBlock])

  const blockStyle: React.CSSProperties = {
    fontFamily: block.style?.fontFamily ?? theme.fontBody,
    fontSize: block.style?.fontSize,
    color: block.style?.color ?? theme.text,
    textAlign: block.style?.textAlign,
    fontWeight: block.style?.bold ? 700 : undefined,
    fontStyle: block.style?.italic ? 'italic' : undefined,
    lineHeight: block.style?.lineHeight,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 rounded-lg' : ''}`}
      onClick={() => selectBlock(block.id)}
    >
      {/* Drag handle + delete — shown on hover/select */}
      <div className={`absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}>
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing text-gray-400"
        >
          <GripVertical size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteBlock(block.id) }}
          className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Block content */}
      {block.type === 'title' && (
        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="outline-none w-full empty:before:content-['标题'] empty:before:text-gray-300"
          style={{
            ...blockStyle,
            fontFamily: block.style?.fontFamily ?? theme.fontHeading,
            fontSize: block.style?.fontSize ?? 36,
            fontWeight: 700,
            textAlign: block.style?.textAlign ?? 'center',
            color: block.style?.color ?? theme.accent,
            lineHeight: 1.3,
            paddingBottom: '0.25em',
            borderBottom: `2px solid ${theme.accent}20`,
          }}
        />
      )}

      {block.type === 'heading' && (
        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="outline-none w-full empty:before:content-['小标题'] empty:before:text-gray-300"
          style={{
            ...blockStyle,
            fontFamily: block.style?.fontFamily ?? theme.fontHeading,
            fontSize: block.style?.fontSize ?? 24,
            fontWeight: 700,
            color: block.style?.color ?? theme.accent,
            lineHeight: 1.4,
          }}
        />
      )}

      {block.type === 'paragraph' && (
        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="outline-none w-full empty:before:content-['在这里写下你的文字...'] empty:before:text-gray-300 whitespace-pre-wrap"
          style={{
            ...blockStyle,
            fontSize: block.style?.fontSize ?? 16,
            lineHeight: block.style?.lineHeight ?? 1.9,
            color: block.style?.color ?? theme.text,
          }}
        />
      )}

      {block.type === 'quote' && (
        <div
          style={{
            borderLeft: `4px solid ${theme.accent}`,
            paddingLeft: '1.25rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            background: `${theme.accent}08`,
            borderRadius: '0 8px 8px 0',
          }}
        >
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="outline-none w-full empty:before:content-['引用内容...'] empty:before:text-gray-300"
            style={{
              ...blockStyle,
              fontStyle: 'italic',
              fontSize: block.style?.fontSize ?? 18,
              lineHeight: block.style?.lineHeight ?? 1.7,
              color: block.style?.color ?? theme.text,
            }}
          />
        </div>
      )}

      {block.type === 'image' && (
        <div className="w-full">
          {block.imageUrl ? (
            <div className="relative group/img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.imageUrl}
                alt={block.imageAlt ?? ''}
                className="w-full h-auto rounded-lg object-cover"
              />
              <button
                onClick={handleImageUpload}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-lg text-white text-sm font-medium"
              >
                更换图片
              </button>
              {/* Caption */}
              <input
                type="text"
                placeholder="图片说明（可选）"
                defaultValue={block.imageCaption}
                onChange={(e) => updateBlock(block.id, { imageCaption: e.target.value })}
                className="mt-2 w-full text-center text-sm outline-none bg-transparent"
                style={{ color: theme.textMuted }}
              />
            </div>
          ) : (
            <button
              onClick={handleImageUpload}
              className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-10 transition-colors"
              style={{ borderColor: `${theme.textMuted}60`, color: theme.textMuted }}
            >
              <ImageIcon size={28} />
              <span className="text-sm">点击上传图片</span>
            </button>
          )}
        </div>
      )}

      {block.type === 'divider' && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px" style={{ background: `${theme.textMuted}40` }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.textMuted }} />
          <div className="flex-1 h-px" style={{ background: `${theme.textMuted}40` }} />
        </div>
      )}

      {block.type === 'spacer' && (
        <div className="h-10 flex items-center justify-center">
          <span className="text-xs text-gray-300 select-none">间距</span>
        </div>
      )}

      {block.type === 'tag' && (
        <div className="inline-flex">
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="outline-none px-3 py-1 rounded-full text-sm font-medium"
            style={{
              background: `${theme.accent}18`,
              color: theme.accent,
              fontFamily: theme.fontBody,
            }}
          />
        </div>
      )}

      {/* Add block after button */}
      <button
        onClick={(e) => { e.stopPropagation(); onAddAfter() }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Plus size={10} /> 添加
      </button>
    </div>
  )
}
