'use client'

import { forwardRef, useEffect } from 'react'
import type { Block, PageTheme } from '@/types/page'
import type { LayoutPreset } from '@/lib/page/layout-presets'
import { loadMultipleFonts } from '@/lib/fonts/loader'

interface LongImagePreviewProps {
  blocks: Block[]
  theme: PageTheme
  preset: LayoutPreset
  watermarkText?: string
  markdownEnabled?: boolean
  onDeleteImageBlock?: (id: string) => void
  deleteImageLabel?: string
}

// ─── Inline markdown renderer ─────────────────────────────────────────────────
// Handles **bold**, *italic* and nested combinations.

function renderInline(text: string, enabled: boolean): React.ReactNode {
  if (!enabled || (!text.includes('**') && !text.includes('*'))) return text

  const parts: React.ReactNode[] = []
  // Match **bold** first (greedy so it takes priority over single *)
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[1] !== undefined) {
      // **bold**
      parts.push(<strong key={key++} style={{ fontWeight: 700 }}>{match[1]}</strong>)
    } else if (match[2] !== undefined) {
      // *italic*
      parts.push(<em key={key++}>{match[2]}</em>)
    }
    lastIndex = re.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts}</>
}

// eslint-disable-next-line react/display-name
export const LongImagePreview = forwardRef<HTMLDivElement, LongImagePreviewProps>(
  ({ blocks, theme, preset, watermarkText, markdownEnabled = true, onDeleteImageBlock, deleteImageLabel }, ref) => {
    useEffect(() => {
      loadMultipleFonts([theme.fontHeading, theme.fontBody])
    }, [theme.fontHeading, theme.fontBody])

    const containerStyle: React.CSSProperties = {
      backgroundColor: theme.background,
      fontFamily: theme.fontBody,
      color: theme.text,
      width: `${preset.contentWidth}px`,
      paddingLeft: `${preset.paddingX}px`,
      paddingRight: `${preset.paddingX}px`,
      paddingTop: `${preset.paddingY}px`,
      paddingBottom: watermarkText ? `${Math.round(preset.paddingY * 0.6)}px` : `${preset.paddingY}px`,
    }

    return (
      <div ref={ref} data-zs-export-root="" style={containerStyle}>
        {blocks.map((block, i) => (
          <BlockRenderer
            key={block.id}
            block={block}
            theme={theme}
            preset={preset}
            isFirst={i === 0}
            isLast={i === blocks.length - 1}
            prevType={i > 0 ? blocks[i - 1].type : undefined}
            markdownEnabled={markdownEnabled}
            onDeleteImageBlock={onDeleteImageBlock}
            deleteImageLabel={deleteImageLabel}
          />
        ))}

        {watermarkText && (
          <WatermarkBlock text={watermarkText} theme={theme} preset={preset} />
        )}
      </div>
    )
  }
)

// ─── Watermark ─────────────────────────────────────────────────────────────────

function WatermarkBlock({ text, theme, preset }: { text: string; theme: PageTheme; preset: LayoutPreset }) {
  return (
    <div
      style={{
        marginTop: preset.titleGap,
        paddingTop: Math.round(preset.blockGap * 0.75),
        borderTop: `1px solid ${theme.textMuted}25`,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div
        style={{
          width: 16,
          height: 1,
          backgroundColor: `${theme.textMuted}50`,
        }}
      />
      <span
        style={{
          fontFamily: theme.fontBody,
          fontSize: 12,
          color: `${theme.textMuted}90`,
          letterSpacing: '0.04em',
        }}
      >
        {text}
      </span>
    </div>
  )
}

// ─── Individual block renderers ────────────────────────────────────────────────

interface BlockRendererProps {
  block: Block
  theme: PageTheme
  preset: LayoutPreset
  isFirst: boolean
  isLast: boolean
  prevType?: Block['type']
  markdownEnabled: boolean
  onDeleteImageBlock?: (id: string) => void
  deleteImageLabel?: string
}

function BlockRenderer({ block, theme, preset, isFirst, isLast, prevType, markdownEnabled, onDeleteImageBlock, deleteImageLabel }: BlockRendererProps) {
  const gapTop = isFirst ? 0 : getGapBefore(block.type, prevType, preset)

  return (
    <div style={{ marginTop: gapTop, paddingBottom: isLast ? Math.round(preset.blockGap * 0.5) : undefined }}>
      {block.type === 'title' && <TitleBlock block={block} theme={theme} preset={preset} markdownEnabled={markdownEnabled} />}
      {block.type === 'heading' && <HeadingBlock block={block} theme={theme} preset={preset} markdownEnabled={markdownEnabled} />}
      {block.type === 'paragraph' && <ParagraphBlock block={block} theme={theme} preset={preset} markdownEnabled={markdownEnabled} />}
      {block.type === 'quote' && <QuoteBlock block={block} theme={theme} preset={preset} markdownEnabled={markdownEnabled} />}
      {block.type === 'list' && <ListBlock block={block} theme={theme} preset={preset} markdownEnabled={markdownEnabled} />}
      {block.type === 'divider' && <DividerBlock theme={theme} preset={preset} />}
      {block.type === 'image' && block.imageUrl && (
        <ImageBlock block={block} theme={theme} onDelete={onDeleteImageBlock} deleteLabel={deleteImageLabel} />
      )}
      {block.type === 'tag' && <TagBlock block={block} theme={theme} />}
    </div>
  )
}

function getGapBefore(type: Block['type'], prevType: Block['type'] | undefined, preset: LayoutPreset): number {
  if (!prevType) return 0
  if (prevType === 'title') return preset.titleGap
  if (type === 'heading') return Math.round(preset.blockGap * 1.6)
  if (type === 'divider') return Math.round(preset.blockGap * 1.2)
  return preset.blockGap
}

function TitleBlock({ block, theme, preset, markdownEnabled }: { block: Block; theme: PageTheme; preset: LayoutPreset; markdownEnabled: boolean }) {
  return (
    <h1
      style={{
        fontFamily: theme.fontHeading,
        fontSize: preset.titleFontSize,
        fontWeight: 700,
        lineHeight: 1.25,
        color: theme.text,
        textAlign: preset.titleAlign,
        wordBreak: 'break-word',
        paddingBottom: preset.titleRule ? '0.8em' : undefined,
        borderBottom: preset.titleRule ? `2px solid ${theme.accent}30` : undefined,
        marginBottom: preset.titleRule ? undefined : 0,
      }}
    >
      {renderInline(block.content, markdownEnabled)}
    </h1>
  )
}

function HeadingBlock({ block, theme, preset, markdownEnabled }: { block: Block; theme: PageTheme; preset: LayoutPreset; markdownEnabled: boolean }) {
  return (
    <h2
      style={{
        fontFamily: theme.fontHeading,
        fontSize: preset.headingFontSize,
        fontWeight: 700,
        lineHeight: 1.35,
        color: theme.accent,
        wordBreak: 'break-word',
      }}
    >
      {renderInline(block.content, markdownEnabled)}
    </h2>
  )
}

function ParagraphBlock({ block, theme, preset, markdownEnabled }: { block: Block; theme: PageTheme; preset: LayoutPreset; markdownEnabled: boolean }) {
  // Split by newlines to preserve line breaks, applying inline markdown per line
  const lines = block.content.split('\n')
  return (
    <p
      style={{
        fontFamily: theme.fontBody,
        fontSize: preset.bodyFontSize,
        lineHeight: preset.lineHeight,
        color: theme.text,
        wordBreak: 'break-word',
        textIndent: preset.paragraphIndent ? '2em' : undefined,
        margin: 0,
      }}
    >
      {lines.map((line, i) => (
        <span key={i}>
          {renderInline(line, markdownEnabled)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  )
}

function QuoteBlock({ block, theme, preset, markdownEnabled }: { block: Block; theme: PageTheme; preset: LayoutPreset; markdownEnabled: boolean }) {
  const content = renderInline(block.content, markdownEnabled)

  if (preset.quoteStyle === 'centered') {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '1.4em 2em',
          background: `${theme.accent}08`,
          borderRadius: 12,
        }}
      >
        <p
          style={{
            fontFamily: theme.fontHeading,
            fontSize: preset.quoteFontSize,
            fontStyle: 'italic',
            lineHeight: preset.lineHeight,
            color: theme.text,
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          &ldquo;{content}&rdquo;
        </p>
      </div>
    )
  }

  if (preset.quoteStyle === 'plain') {
    return (
      <p
        style={{
          fontFamily: theme.fontBody,
          fontSize: preset.quoteFontSize,
          fontStyle: 'italic',
          lineHeight: preset.lineHeight,
          color: theme.textMuted,
          wordBreak: 'break-word',
          paddingLeft: '1em',
          margin: 0,
        }}
      >
        {content}
      </p>
    )
  }

  return (
    <div
      style={{
        borderLeft: `4px solid ${theme.accent}`,
        paddingLeft: '1.25em',
        paddingTop: '0.6em',
        paddingBottom: '0.6em',
        background: `${theme.accent}0a`,
        borderRadius: '0 10px 10px 0',
      }}
    >
      <p
        style={{
          fontFamily: theme.fontBody,
          fontSize: preset.quoteFontSize,
          fontStyle: 'italic',
          lineHeight: preset.lineHeight,
          color: theme.text,
          wordBreak: 'break-word',
          margin: 0,
        }}
      >
        {content}
      </p>
    </div>
  )
}

function ListBlock({ block, theme, preset, markdownEnabled }: { block: Block; theme: PageTheme; preset: LayoutPreset; markdownEnabled: boolean }) {
  const items = block.listItems ?? block.content.split('\n').filter(Boolean)
  const ordered = block.listOrdered ?? false
  const Tag = ordered ? 'ol' : 'ul'

  return (
    <Tag
      style={{
        fontFamily: theme.fontBody,
        fontSize: preset.bodyFontSize,
        lineHeight: preset.lineHeight,
        color: theme.text,
        margin: 0,
        paddingLeft: '1.6em',
        wordBreak: 'break-word',
        listStyleType: ordered ? 'decimal' : 'disc',
      }}
    >
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: i < items.length - 1 ? '0.35em' : 0 }}>
          {renderInline(item, markdownEnabled)}
        </li>
      ))}
    </Tag>
  )
}

function DividerBlock({ theme, preset }: { theme: PageTheme; preset: LayoutPreset }) {
  if (preset.dividerStyle === 'dots') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          justifyContent: 'center',
          paddingTop: 6,
          paddingBottom: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: `${theme.textMuted}70`,
            }}
          />
        ))}
      </div>
    )
  }

  if (preset.dividerStyle === 'asterisks') {
    return (
      <div
        style={{
          textAlign: 'center',
          color: `${theme.textMuted}80`,
          fontSize: 14,
          letterSpacing: '0.5em',
          paddingTop: 6,
          paddingBottom: 6,
        }}
      >
        ✦ ✦ ✦
      </div>
    )
  }

  return (
    <div
      style={{
        height: 1,
        background: `${theme.textMuted}30`,
        borderRadius: 1,
      }}
    />
  )
}

function ImageBlock({ block, theme, onDelete, deleteLabel }: { block: Block; theme: PageTheme; onDelete?: (id: string) => void; deleteLabel?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      {onDelete && (
        <button
          type="button"
          data-export-ignore="true"
          onClick={() => onDelete(block.id)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 16,
            lineHeight: 1,
          }}
          aria-label={deleteLabel ?? 'Remove image'}
        >
          ×
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.imageUrl}
        alt={block.imageAlt ?? ''}
        style={{ width: '100%', height: 'auto', borderRadius: 10, display: 'block' }}
      />
      {block.imageCaption && (
        <p
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: theme.textMuted,
            marginTop: 8,
            margin: '8px 0 0 0',
          }}
        >
          {block.imageCaption}
        </p>
      )}
    </div>
  )
}

function TagBlock({ block, theme }: { block: Block; theme: PageTheme }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: `${theme.accent}18`,
        color: theme.accent,
        fontSize: 13,
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: 999,
        fontFamily: theme.fontBody,
      }}
    >
      {block.content}
    </span>
  )
}
