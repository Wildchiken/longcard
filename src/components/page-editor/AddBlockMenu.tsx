'use client'

import type { Block } from '@/types/page'
import { Type, Heading2, AlignLeft, Quote, ImageIcon, Minus, Space, Tag } from 'lucide-react'

interface AddBlockMenuProps {
  onAdd: (type: Block['type']) => void
  onClose: () => void
}

const BLOCK_TYPES: { type: Block['type']; label: string; icon: React.ComponentType<{size?: number}>; desc: string }[] = [
  { type: 'title', label: '大标题', icon: Type, desc: '页面主标题' },
  { type: 'heading', label: '小标题', icon: Heading2, desc: '章节标题' },
  { type: 'paragraph', label: '正文', icon: AlignLeft, desc: '普通文字段落' },
  { type: 'quote', label: '引用', icon: Quote, desc: '高亮引用文字' },
  { type: 'image', label: '图片', icon: ImageIcon, desc: '插入本地图片' },
  { type: 'divider', label: '分割线', icon: Minus, desc: '章节分隔符' },
  { type: 'spacer', label: '间距', icon: Space, desc: '空白间距块' },
  { type: 'tag', label: '标签', icon: Tag, desc: '彩色标签徽章' },
]

export function AddBlockMenu({ onAdd, onClose }: AddBlockMenuProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-xs mx-4 mb-6 sm:mb-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">添加内容块</p>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1">
          {BLOCK_TYPES.map(({ type, label, icon: Icon, desc }) => (
            <button
              key={type}
              onClick={() => { onAdd(type); onClose() }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon size={15} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
