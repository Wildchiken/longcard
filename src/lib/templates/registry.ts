import type { Template } from '@/types/template'

export const TEMPLATES: Template[] = [
  // ── QUOTE CARDS ──
  {
    id: 'quote-classic',
    name: '经典引用',
    category: 'quote-card',
    format: 'square',
    themeId: 'minimal-white',
    thumbnailColor: '#F8F8F8',
    tags: ['minimal', 'quote', 'clean'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#FFFFFF' } },
      {
        type: 'decoration', id: 'quote-mark-open', label: '引号左', decorationId: 'quote-open',
        fabricProps: { left: 80, top: 120, scaleX: 0.6, scaleY: 0.6, fill: '#CCCCCC' },
      },
      {
        type: 'text', id: 'quote-text', label: '引文', defaultText: '这里是你的文字\n每一行都是\n一首小诗',
        fabricProps: { left: 100, top: 220, fontSize: 52, fontFamily: 'Lora', fill: '#1A1A1A', textAlign: 'center', width: 880, lineHeight: 1.6, fontStyle: 'italic' },
      },
      {
        type: 'text', id: 'author', label: '作者', defaultText: '— 作者名',
        fabricProps: { left: 100, top: 720, fontSize: 28, fontFamily: 'DM Sans', fill: '#888888', textAlign: 'center', width: 880 },
      },
    ],
  },
  {
    id: 'quote-bold',
    name: '粗体引用',
    category: 'quote-card',
    format: 'square',
    themeId: 'midnight',
    thumbnailColor: '#0A0E1A',
    tags: ['bold', 'dark', 'dramatic'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#0A0E1A' } },
      {
        type: 'shape', id: 'accent-line', label: '装饰线',
        fabricProps: { left: 80, top: 380, width: 60, height: 6, fill: '#7B9FE0', rx: 3 },
      },
      {
        type: 'text', id: 'quote-text', label: '引文', defaultText: 'MAKE IT\nCOUNT',
        fabricProps: { left: 80, top: 220, fontSize: 120, fontFamily: 'Bebas Neue', fill: '#E8EDF8', textAlign: 'left', width: 920, lineHeight: 1 },
      },
      {
        type: 'text', id: 'sub-text', label: '副文', defaultText: '每一天都值得认真对待',
        fabricProps: { left: 80, top: 440, fontSize: 32, fontFamily: 'DM Sans', fill: '#7B9FE0', textAlign: 'left', width: 920 },
      },
    ],
  },
  {
    id: 'quote-handwritten',
    name: '手写风格',
    category: 'quote-card',
    format: 'square',
    themeId: 'cottagecore',
    thumbnailColor: '#F7F3ED',
    tags: ['handwritten', 'cute', 'soft'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F7F3ED' } },
      {
        type: 'text', id: 'main-text', label: '正文', defaultText: '生活是\n一场温柔的\n冒险',
        fabricProps: { left: 100, top: 280, fontSize: 80, fontFamily: 'Caveat', fill: '#3D3426', textAlign: 'center', width: 880, lineHeight: 1.5 },
      },
      {
        type: 'text', id: 'date', label: '日期', defaultText: '2024.01.01',
        fabricProps: { left: 100, top: 800, fontSize: 26, fontFamily: 'Caveat', fill: '#8B7D5E', textAlign: 'center', width: 880 },
      },
    ],
  },

  // ── JOURNAL ──
  {
    id: 'journal-minimal',
    name: '极简日记',
    category: 'journal',
    format: 'portrait',
    themeId: 'minimal-white',
    thumbnailColor: '#FAFAFA',
    tags: ['journal', 'minimal', 'clean'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#FAFAFA' } },
      {
        type: 'text', id: 'date', label: '日期', defaultText: '2024年1月1日',
        fabricProps: { left: 80, top: 80, fontSize: 28, fontFamily: 'DM Sans', fill: '#AAAAAA', fontWeight: 300, width: 920 },
      },
      {
        type: 'shape', id: 'divider', label: '分割线',
        fabricProps: { left: 80, top: 140, width: 920, height: 1, fill: '#EEEEEE' },
      },
      {
        type: 'text', id: 'title', label: '标题', defaultText: '今天的心情',
        fabricProps: { left: 80, top: 180, fontSize: 64, fontFamily: 'Playfair Display', fill: '#1A1A1A', fontWeight: 700, width: 920 },
      },
      {
        type: 'text', id: 'body', label: '内容', defaultText: '在这里写下你的故事...\n\n每一个字都是时间的印记。',
        fabricProps: { left: 80, top: 300, fontSize: 36, fontFamily: 'Lora', fill: '#555555', width: 920, lineHeight: 1.8 },
      },
    ],
  },
  {
    id: 'journal-dark',
    name: '暗夜日记',
    category: 'journal',
    format: 'portrait',
    themeId: 'dark-academia',
    thumbnailColor: '#1C1914',
    tags: ['journal', 'dark', 'academia'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#1C1914' } },
      {
        type: 'text', id: 'chapter', label: '章节', defaultText: 'Chapter I',
        fabricProps: { left: 80, top: 80, fontSize: 22, fontFamily: 'EB Garamond', fill: '#9A8468', textAlign: 'left', width: 920, charSpacing: 200 },
      },
      {
        type: 'text', id: 'title', label: '标题', defaultText: '黑暗中的\n一束光',
        fabricProps: { left: 80, top: 160, fontSize: 80, fontFamily: 'Cormorant Garamond', fill: '#D4B896', fontWeight: 300, lineHeight: 1.2, width: 920 },
      },
      {
        type: 'shape', id: 'divider', label: '装饰线',
        fabricProps: { left: 80, top: 420, width: 120, height: 2, fill: '#9A8468' },
      },
      {
        type: 'text', id: 'body', label: '内容', defaultText: '夜色如墨，而你的文字\n是最后一颗星。',
        fabricProps: { left: 80, top: 460, fontSize: 38, fontFamily: 'EB Garamond', fill: '#EDE0CC', width: 920, lineHeight: 1.9, fontStyle: 'italic' },
      },
    ],
  },

  // ── SINGLE COLUMN ──
  {
    id: 'single-editorial',
    name: '杂志单栏',
    category: 'single-column',
    format: 'portrait',
    themeId: 'minimal-white',
    thumbnailColor: '#FFFFFF',
    tags: ['editorial', 'magazine', 'clean'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#FFFFFF' } },
      {
        type: 'image-placeholder', id: 'hero-image', label: '主图', aspectRatio: 1,
        fabricProps: { left: 0, top: 0, width: 1080, height: 540 },
      },
      {
        type: 'text', id: 'category', label: '类别', defaultText: 'LIFESTYLE',
        fabricProps: { left: 80, top: 580, fontSize: 22, fontFamily: 'DM Sans', fill: '#888888', charSpacing: 300, width: 920 },
      },
      {
        type: 'text', id: 'headline', label: '标题', defaultText: '如何过好\n每一天',
        fabricProps: { left: 80, top: 640, fontSize: 80, fontFamily: 'Playfair Display', fill: '#1A1A1A', fontWeight: 700, lineHeight: 1.1, width: 920 },
      },
      {
        type: 'text', id: 'body', label: '内容', defaultText: '这里是文章的正文内容，简短有力，直击心灵。',
        fabricProps: { left: 80, top: 900, fontSize: 34, fontFamily: 'Inter', fill: '#555555', width: 920, lineHeight: 1.7 },
      },
    ],
  },

  // ── SPLIT ──
  {
    id: 'split-half',
    name: '左右对分',
    category: 'split',
    format: 'square',
    themeId: 'risograph',
    thumbnailColor: '#F5F0E8',
    tags: ['split', 'bold', 'design'],
    layers: [
      { type: 'background', id: 'bg-left', label: '左背景', fabricProps: { fill: '#E8572A', left: 0, top: 0, width: 540, height: 1080 } },
      { type: 'background', id: 'bg-right', label: '右背景', fabricProps: { fill: '#F5F0E8', left: 540, top: 0, width: 540, height: 1080 } },
      {
        type: 'text', id: 'left-text', label: '左文字', defaultText: 'ONE',
        fabricProps: { left: 40, top: 420, fontSize: 120, fontFamily: 'Bebas Neue', fill: '#F5F0E8', textAlign: 'center', width: 460, lineHeight: 1 },
      },
      {
        type: 'text', id: 'right-title', label: '右标题', defaultText: '相遇\n是最美的\n风景',
        fabricProps: { left: 600, top: 300, fontSize: 64, fontFamily: 'Cormorant Garamond', fill: '#1A1A2E', lineHeight: 1.4, width: 440 },
      },
      {
        type: 'text', id: 'right-body', label: '右内容', defaultText: '这里是副文本',
        fabricProps: { left: 600, top: 700, fontSize: 28, fontFamily: 'DM Sans', fill: '#6B6B6B', width: 440, lineHeight: 1.6 },
      },
    ],
  },

  // ── MAGAZINE COVER ──
  {
    id: 'magazine-cover-bold',
    name: '杂志封面',
    category: 'magazine-cover',
    format: 'portrait',
    themeId: 'retro-sunset',
    thumbnailColor: '#F5E6D3',
    tags: ['magazine', 'cover', 'bold'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F5E6D3' } },
      {
        type: 'text', id: 'mag-name', label: '杂志名', defaultText: 'ZINE',
        fabricProps: { left: 40, top: 60, fontSize: 160, fontFamily: 'Bebas Neue', fill: '#D4520A', lineHeight: 1, width: 1000 },
      },
      {
        type: 'image-placeholder', id: 'cover-image', label: '封面图', aspectRatio: 0.75,
        fabricProps: { left: 0, top: 200, width: 1080, height: 700 },
      },
      {
        type: 'text', id: 'issue', label: '期号', defaultText: 'VOL.01 / 2024',
        fabricProps: { left: 40, top: 1180, fontSize: 24, fontFamily: 'DM Sans', fill: '#8A5A3A', charSpacing: 200, width: 1000 },
      },
      {
        type: 'text', id: 'headline', label: '封面标题', defaultText: '本期主题：寻找生活里的美',
        fabricProps: { left: 40, top: 1220, fontSize: 38, fontFamily: 'Lora', fill: '#2C1A0A', width: 1000, fontStyle: 'italic' },
      },
    ],
  },

  // ── COLLAGE ──
  {
    id: 'collage-polaroid',
    name: '宝丽来拼贴',
    category: 'collage',
    format: 'square',
    themeId: 'minimal-white',
    thumbnailColor: '#F5F5F0',
    tags: ['collage', 'polaroid', 'vintage'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F5F5F0' } },
      {
        type: 'shape', id: 'polaroid-1', label: '相框1',
        fabricProps: { left: 60, top: 80, width: 420, height: 480, fill: '#FFFFFF', rx: 4, shadow: '2px 4px 12px rgba(0,0,0,0.12)' },
      },
      {
        type: 'image-placeholder', id: 'photo-1', label: '照片1', aspectRatio: 1,
        fabricProps: { left: 80, top: 100, width: 380, height: 380 },
      },
      {
        type: 'text', id: 'caption-1', label: '说明1', defaultText: 'memory',
        fabricProps: { left: 80, top: 496, fontSize: 32, fontFamily: 'Caveat', fill: '#555555', textAlign: 'center', width: 380 },
      },
      {
        type: 'shape', id: 'polaroid-2', label: '相框2',
        fabricProps: { left: 580, top: 200, width: 420, height: 480, fill: '#FFFFFF', rx: 4, shadow: '2px 4px 12px rgba(0,0,0,0.12)' },
      },
      {
        type: 'image-placeholder', id: 'photo-2', label: '照片2', aspectRatio: 1,
        fabricProps: { left: 600, top: 220, width: 380, height: 380 },
      },
      {
        type: 'text', id: 'caption-2', label: '说明2', defaultText: 'forever',
        fabricProps: { left: 600, top: 616, fontSize: 32, fontFamily: 'Caveat', fill: '#555555', textAlign: 'center', width: 380 },
      },
      {
        type: 'text', id: 'main-title', label: '标题', defaultText: '记忆的碎片',
        fabricProps: { left: 60, top: 720, fontSize: 56, fontFamily: 'Cormorant Garamond', fill: '#3D3426', textAlign: 'center', width: 960, fontStyle: 'italic' },
      },
    ],
  },

  // ── MINIMAL ──
  {
    id: 'minimal-text',
    name: '纯文字极简',
    category: 'minimal',
    format: 'square',
    themeId: 'monochrome',
    thumbnailColor: '#F2F2F2',
    tags: ['minimal', 'text-only', 'clean'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F2F2F2' } },
      {
        type: 'text', id: 'main', label: '主文字', defaultText: '你好\n世界',
        fabricProps: { left: 80, top: 360, fontSize: 140, fontFamily: 'Josefin Sans', fill: '#1A1A1A', fontWeight: 700, lineHeight: 1, width: 920, textAlign: 'center' },
      },
    ],
  },
  {
    id: 'minimal-centered',
    name: '居中极简',
    category: 'minimal',
    format: 'square',
    themeId: 'minimal-white',
    thumbnailColor: '#FFFFFF',
    tags: ['minimal', 'centered', 'elegant'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#FFFFFF' } },
      {
        type: 'text', id: 'headline', label: '标题', defaultText: 'LESS IS\nMORE',
        fabricProps: { left: 80, top: 320, fontSize: 110, fontFamily: 'Outfit', fill: '#111111', fontWeight: 700, textAlign: 'center', width: 920, lineHeight: 1.1, charSpacing: 100 },
      },
      {
        type: 'shape', id: 'line', label: '线条',
        fabricProps: { left: 440, top: 660, width: 200, height: 2, fill: '#111111' },
      },
      {
        type: 'text', id: 'sub', label: '副标题', defaultText: '少即是多',
        fabricProps: { left: 80, top: 700, fontSize: 36, fontFamily: 'DM Sans', fill: '#888888', textAlign: 'center', width: 920, charSpacing: 400 },
      },
    ],
  },

  // ── RISOGRAPH ──
  {
    id: 'riso-overlap',
    name: 'Riso 叠印',
    category: 'risograph',
    format: 'square',
    themeId: 'risograph',
    thumbnailColor: '#F5F0E8',
    tags: ['risograph', 'print', 'retro'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F5F0E8' } },
      {
        type: 'shape', id: 'circle-blue', label: '蓝圆',
        fabricProps: { left: 200, top: 150, radius: 320, fill: '#3D6B8C', opacity: 0.85 },
      },
      {
        type: 'shape', id: 'circle-orange', label: '橙圆',
        fabricProps: { left: 380, top: 380, radius: 300, fill: '#E8572A', opacity: 0.8 },
      },
      {
        type: 'text', id: 'title', label: '标题', defaultText: 'OVERLAP',
        fabricProps: { left: 80, top: 420, fontSize: 120, fontFamily: 'Bebas Neue', fill: '#F5F0E8', textAlign: 'center', width: 920 },
      },
    ],
  },

  // ── POLAROID ──
  {
    id: 'polaroid-single',
    name: '单张宝丽来',
    category: 'polaroid',
    format: 'portrait',
    themeId: 'minimal-white',
    thumbnailColor: '#FFFFFF',
    tags: ['polaroid', 'photo', 'vintage'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#E8E0D4' } },
      {
        type: 'shape', id: 'frame', label: '相框',
        fabricProps: { left: 115, top: 120, width: 850, height: 980, fill: '#FFFFFF', rx: 4, shadow: '4px 8px 24px rgba(0,0,0,0.15)' },
      },
      {
        type: 'image-placeholder', id: 'photo', label: '照片', aspectRatio: 1,
        fabricProps: { left: 155, top: 160, width: 770, height: 770 },
      },
      {
        type: 'text', id: 'caption', label: '说明文字', defaultText: 'a beautiful day',
        fabricProps: { left: 115, top: 980, fontSize: 48, fontFamily: 'Caveat', fill: '#3D3426', textAlign: 'center', width: 850 },
      },
    ],
  },

  // ── STORY FORMAT ──
  {
    id: 'story-gradient',
    name: '故事渐变',
    category: 'single-column',
    format: 'story',
    themeId: 'midnight',
    thumbnailColor: '#0A0E1A',
    tags: ['story', 'gradient', 'dark'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#0A0E1A' } },
      {
        type: 'text', id: 'headline', label: '主文字', defaultText: '今晚\n星星\n特别亮',
        fabricProps: { left: 80, top: 600, fontSize: 140, fontFamily: 'Cormorant Garamond', fill: '#E8EDF8', lineHeight: 1.1, width: 920, fontWeight: 300 },
      },
      {
        type: 'text', id: 'sub', label: '副文字', defaultText: '写给今天的你',
        fabricProps: { left: 80, top: 1140, fontSize: 40, fontFamily: 'DM Sans', fill: '#7B9FE0', width: 920 },
      },
    ],
  },

  {
    id: 'story-photo',
    name: '故事照片',
    category: 'single-column',
    format: 'story',
    themeId: 'minimal-white',
    thumbnailColor: '#F8F8F8',
    tags: ['story', 'photo', 'editorial'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F8F8F8' } },
      {
        type: 'image-placeholder', id: 'main-photo', label: '主图', aspectRatio: 0.5625,
        fabricProps: { left: 0, top: 0, width: 1080, height: 1350 },
      },
      {
        type: 'shape', id: 'overlay', label: '渐变遮罩',
        fabricProps: { left: 0, top: 900, width: 1080, height: 1020, fill: 'rgba(0,0,0,0.6)' },
      },
      {
        type: 'text', id: 'title', label: '标题', defaultText: '这一刻\n值得记录',
        fabricProps: { left: 80, top: 1100, fontSize: 96, fontFamily: 'Playfair Display', fill: '#FFFFFF', lineHeight: 1.2, width: 920 },
      },
    ],
  },

  // ── Y2K ──
  {
    id: 'y2k-bold',
    name: 'Y2K 风格',
    category: 'minimal',
    format: 'square',
    themeId: 'y2k-neon',
    thumbnailColor: '#0D0D1A',
    tags: ['y2k', 'neon', 'futuristic'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#0D0D1A' } },
      {
        type: 'shape', id: 'glow-circle', label: '光晕',
        fabricProps: { left: 240, top: 240, radius: 300, fill: 'transparent', stroke: '#FF00FF', strokeWidth: 2, opacity: 0.4 },
      },
      {
        type: 'text', id: 'main', label: '主文字', defaultText: 'FUTURE\nIS NOW',
        fabricProps: { left: 80, top: 320, fontSize: 120, fontFamily: 'Bebas Neue', fill: '#FF00FF', textAlign: 'center', width: 920, lineHeight: 1, charSpacing: 100 },
      },
      {
        type: 'text', id: 'sub', label: '副文字', defaultText: '2024',
        fabricProps: { left: 80, top: 700, fontSize: 40, fontFamily: 'Space Mono', fill: '#00FFFF', textAlign: 'center', width: 920, charSpacing: 600 },
      },
    ],
  },

  // ── LAVENDER ──
  {
    id: 'lavender-soft',
    name: '薰衣草温柔',
    category: 'quote-card',
    format: 'square',
    themeId: 'lavender-dream',
    thumbnailColor: '#F5F0FF',
    tags: ['soft', 'dreamy', 'purple'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F5F0FF' } },
      {
        type: 'shape', id: 'circle-deco', label: '圆形装饰',
        fabricProps: { left: 700, top: 50, radius: 200, fill: '#EBE0FF', opacity: 0.8 },
      },
      {
        type: 'text', id: 'main', label: '主文字', defaultText: '愿你\n温柔以待\n这个世界',
        fabricProps: { left: 80, top: 280, fontSize: 80, fontFamily: 'Cormorant Garamond', fill: '#2A1A4A', lineHeight: 1.6, width: 920, textAlign: 'center' },
      },
      {
        type: 'text', id: 'sub', label: '装饰文字', defaultText: '✦',
        fabricProps: { left: 80, top: 820, fontSize: 48, fontFamily: 'DM Sans', fill: '#9B7EC8', textAlign: 'center', width: 920 },
      },
    ],
  },

  // ── COFFEE ──
  {
    id: 'coffee-warm',
    name: '咖啡馆日记',
    category: 'journal',
    format: 'portrait',
    themeId: 'coffee',
    thumbnailColor: '#F4ECD8',
    tags: ['warm', 'cozy', 'journal'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F4ECD8' } },
      {
        type: 'shape', id: 'top-bar', label: '顶部装饰',
        fabricProps: { left: 0, top: 0, width: 1080, height: 8, fill: '#5C3D1E' },
      },
      {
        type: 'text', id: 'greeting', label: '问候', defaultText: 'Good Morning',
        fabricProps: { left: 80, top: 80, fontSize: 36, fontFamily: 'Dancing Script', fill: '#8B6340', width: 920 },
      },
      {
        type: 'text', id: 'title', label: '标题', defaultText: '一杯咖啡\n一个早晨',
        fabricProps: { left: 80, top: 160, fontSize: 90, fontFamily: 'Playfair Display', fill: '#2C1A08', lineHeight: 1.2, width: 920, fontWeight: 700 },
      },
      {
        type: 'shape', id: 'divider', label: '分割线',
        fabricProps: { left: 80, top: 460, width: 200, height: 2, fill: '#8B6340' },
      },
      {
        type: 'text', id: 'body', label: '内容', defaultText: '坐在窗边，阳光刚好，\n一切都慢慢的，慢慢的。',
        fabricProps: { left: 80, top: 500, fontSize: 40, fontFamily: 'Lora', fill: '#5C3D1E', width: 920, lineHeight: 1.8, fontStyle: 'italic' },
      },
    ],
  },

  // ── MATCHA ──
  {
    id: 'matcha-zen',
    name: '抹茶禅意',
    category: 'minimal',
    format: 'square',
    themeId: 'matcha',
    thumbnailColor: '#F0F4EF',
    tags: ['minimal', 'zen', 'green'],
    layers: [
      { type: 'background', id: 'bg', label: '背景', fabricProps: { fill: '#F0F4EF' } },
      {
        type: 'shape', id: 'circle', label: '圆圈',
        fabricProps: { left: 340, top: 340, radius: 200, fill: 'transparent', stroke: '#4A7C59', strokeWidth: 1.5, opacity: 0.5 },
      },
      {
        type: 'text', id: 'main', label: '主文字', defaultText: '静',
        fabricProps: { left: 80, top: 280, fontSize: 400, fontFamily: 'Cormorant Garamond', fill: '#4A7C59', textAlign: 'center', width: 920, opacity: 0.2 },
      },
      {
        type: 'text', id: 'sub', label: '副文字', defaultText: '慢下来，感受当下',
        fabricProps: { left: 80, top: 750, fontSize: 40, fontFamily: 'DM Sans', fill: '#2D5E3C', textAlign: 'center', width: 920, charSpacing: 200 },
      },
    ],
  },
]

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: string): Template[] {
  return TEMPLATES.filter((t) => t.category === category)
}

export function getTemplatesByFormat(format: string): Template[] {
  return TEMPLATES.filter((t) => t.format === format)
}
