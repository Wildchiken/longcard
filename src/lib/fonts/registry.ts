export interface FontDef {
  id: string
  name: string
  family: string
  category: 'serif' | 'sans-serif' | 'handwriting' | 'display' | 'monospace'
  weights: number[]
  googleFamily: string
}

export const CURATED_FONTS: FontDef[] = [
  // Serif
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display', category: 'serif', weights: [400, 700, 900], googleFamily: 'Playfair+Display:wght@400;700;900' },
  { id: 'lora', name: 'Lora', family: 'Lora', category: 'serif', weights: [400, 600, 700], googleFamily: 'Lora:wght@400;600;700' },
  { id: 'eb-garamond', name: 'EB Garamond', family: 'EB Garamond', category: 'serif', weights: [400, 500, 700], googleFamily: 'EB+Garamond:wght@400;500;700' },
  { id: 'cormorant', name: 'Cormorant Garamond', family: 'Cormorant Garamond', category: 'serif', weights: [300, 400, 700], googleFamily: 'Cormorant+Garamond:wght@300;400;700' },
  { id: 'libre-baskerville', name: 'Libre Baskerville', family: 'Libre Baskerville', category: 'serif', weights: [400, 700], googleFamily: 'Libre+Baskerville:wght@400;700' },
  // Sans-serif
  { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans', category: 'sans-serif', weights: [300, 400, 500, 700], googleFamily: 'DM+Sans:wght@300;400;500;700' },
  { id: 'inter', name: 'Inter', family: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 700], googleFamily: 'Inter:wght@300;400;500;700' },
  { id: 'outfit', name: 'Outfit', family: 'Outfit', category: 'sans-serif', weights: [300, 400, 600, 700], googleFamily: 'Outfit:wght@300;400;600;700' },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans', category: 'sans-serif', weights: [300, 400, 600, 700], googleFamily: 'Plus+Jakarta+Sans:wght@300;400;600;700' },
  { id: 'josefin-sans', name: 'Josefin Sans', family: 'Josefin Sans', category: 'sans-serif', weights: [300, 400, 600, 700], googleFamily: 'Josefin+Sans:wght@300;400;600;700' },
  { id: 'nunito', name: 'Nunito', family: 'Nunito', category: 'sans-serif', weights: [300, 400, 600, 800], googleFamily: 'Nunito:wght@300;400;600;800' },
  // Handwriting
  { id: 'caveat', name: 'Caveat', family: 'Caveat', category: 'handwriting', weights: [400, 600, 700], googleFamily: 'Caveat:wght@400;600;700' },
  { id: 'dancing-script', name: 'Dancing Script', family: 'Dancing Script', category: 'handwriting', weights: [400, 600, 700], googleFamily: 'Dancing+Script:wght@400;600;700' },
  { id: 'pacifico', name: 'Pacifico', family: 'Pacifico', category: 'handwriting', weights: [400], googleFamily: 'Pacifico' },
  { id: 'kalam', name: 'Kalam', family: 'Kalam', category: 'handwriting', weights: [300, 400, 700], googleFamily: 'Kalam:wght@300;400;700' },
  { id: 'indie-flower', name: 'Indie Flower', family: 'Indie Flower', category: 'handwriting', weights: [400], googleFamily: 'Indie+Flower' },
  // Display
  { id: 'bebas-neue', name: 'Bebas Neue', family: 'Bebas Neue', category: 'display', weights: [400], googleFamily: 'Bebas+Neue' },
  { id: 'anton', name: 'Anton', family: 'Anton', category: 'display', weights: [400], googleFamily: 'Anton' },
  { id: 'abril-fatface', name: 'Abril Fatface', family: 'Abril Fatface', category: 'display', weights: [400], googleFamily: 'Abril+Fatface' },
  { id: 'righteous', name: 'Righteous', family: 'Righteous', category: 'display', weights: [400], googleFamily: 'Righteous' },
  { id: 'fredoka', name: 'Fredoka', family: 'Fredoka', category: 'display', weights: [300, 400, 600, 700], googleFamily: 'Fredoka:wght@300;400;600;700' },
  // Monospace
  { id: 'space-mono', name: 'Space Mono', family: 'Space Mono', category: 'monospace', weights: [400, 700], googleFamily: 'Space+Mono:wght@400;700' },
  { id: 'fira-code', name: 'Fira Code', family: 'Fira Code', category: 'monospace', weights: [300, 400, 700], googleFamily: 'Fira+Code:wght@300;400;700' },
]

export interface FontPairing {
  id: string
  name: string
  heading: string
  body: string
  description: string
}

export const FONT_PAIRINGS: FontPairing[] = [
  { id: 'editorial', name: '编辑风格', heading: 'Playfair Display', body: 'DM Sans', description: '优雅衬线标题 + 现代无衬线正文' },
  { id: 'classic', name: '经典搭配', heading: 'EB Garamond', body: 'Outfit', description: '复古衬线 + 简洁圆润正文' },
  { id: 'modern', name: '现代简约', heading: 'Bebas Neue', body: 'Inter', description: '大胆展示字体 + 可读性极强的正文' },
  { id: 'journal', name: '手账风', heading: 'Caveat', body: 'Lora', description: '手写标题 + 优雅衬线正文' },
  { id: 'minimal', name: '极简主义', heading: 'Josefin Sans', body: 'Nunito', description: '纤细无衬线 + 圆润友好的正文' },
  { id: 'academia', name: '学院派', heading: 'Cormorant Garamond', body: 'Libre Baskerville', description: '贵族衬线标题 + 经典衬线正文' },
  { id: 'playful', name: '活泼可爱', heading: 'Fredoka', body: 'Plus Jakarta Sans', description: '圆润展示字体 + 现代正文' },
  { id: 'dark', name: '暗黑风格', heading: 'Anton', body: 'Space Mono', description: '冲击力标题 + 等宽机械感正文' },
]

export function getFontById(id: string): FontDef | undefined {
  return CURATED_FONTS.find((f) => f.id === id)
}

export function getFontByFamily(family: string): FontDef | undefined {
  return CURATED_FONTS.find((f) => f.family === family)
}
