export type UiTheme = 'aurora' | 'dusk' | 'lilac-peach'

export const DEFAULT_UI_THEME: UiTheme = 'aurora'

export const UI_THEMES: { id: UiTheme; label: string; themeColor: string }[] = [
  { id: 'aurora', label: 'Aurora', themeColor: '#6D5BD0' },
  { id: 'dusk', label: 'Dusk', themeColor: '#5B4B9A' },
  { id: 'lilac-peach', label: 'Lilac', themeColor: '#5A3E8C' },
]

export function nextUiTheme(current: UiTheme): UiTheme {
  const idx = UI_THEMES.findIndex((t) => t.id === current)
  return UI_THEMES[(idx + 1) % UI_THEMES.length]!.id
}
