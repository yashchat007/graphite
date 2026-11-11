import { useEffect } from 'react'
import { UI_THEMES } from '../lib/themes'
import { useGraphiteStore } from '../store/useGraphiteStore'

export function useAppTheme() {
  const uiTheme = useGraphiteStore((s) => s.uiTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme)
    const meta = UI_THEMES.find((t) => t.id === uiTheme)
    if (meta) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', meta.themeColor)
    }
  }, [uiTheme])
}
