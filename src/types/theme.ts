export interface ColorTheme {
  id: string
  name: string
  aesthetic: string
  colors: {
    background: string
    surface: string
    primary: string
    secondary: string
    accent: string
    text: string
    textMuted: string
  }
  textureOverlay?: string
  gradientPresets?: string[][]
}
