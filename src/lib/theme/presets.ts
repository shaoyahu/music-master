/**
 * 主题预设：将调色板应用到 DOM (CSS 变量 + 主题 class)
 */

import { PALETTES, type ThemeId } from './palette'

export type ThemeMode = 'light' | 'dark'

export function applyTheme(themeId: ThemeId, mode: ThemeMode): void {
  if (typeof document === 'undefined') return
  const palette = PALETTES[themeId][mode]
  const root = document.documentElement
  root.setAttribute('data-theme', themeId)
  root.setAttribute('data-theme-mode', mode)
  root.style.setProperty('--mm-bg', palette.bg)
  root.style.setProperty('--mm-bg-elevated', palette.bgElevated)
  root.style.setProperty('--mm-fg', palette.fg)
  root.style.setProperty('--mm-fg-muted', palette.fgMuted)
  root.style.setProperty('--mm-primary', palette.primary)
  root.style.setProperty('--mm-primary-fg', palette.primaryFg)
  root.style.setProperty('--mm-accent', palette.accent)
  root.style.setProperty('--mm-border', palette.border)
  root.style.setProperty('--mm-danger', palette.danger)
  root.style.setProperty('--mm-success', palette.success)
}

export function getStoredThemeMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light'
  return (localStorage.getItem('mm.themeMode') as ThemeMode) ?? 'light'
}

export function persistThemeMode(mode: ThemeMode): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('mm.themeMode', mode)
}

export function getStoredThemeId(): ThemeId {
  if (typeof localStorage === 'undefined') return 'minimal'
  return (localStorage.getItem('mm.themeId') as ThemeId) ?? 'minimal'
}

export function persistThemeId(theme: ThemeId): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('mm.themeId', theme)
}
