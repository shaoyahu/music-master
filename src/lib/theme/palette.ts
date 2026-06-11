/**
 * 10 套调色板定义（CSS 变量值）
 * 4 套（warm/cyberpunk/minimal/lightgreen）配独立样式
 * 其余 6 套复用 minimal 基础 + 调色板变量
 */

export type ThemeId =
  | 'warm'
  | 'fresh'
  | 'cyberpunk'
  | 'business'
  | 'cartoon'
  | 'minimal'
  | 'retro'
  | 'dark'
  | 'lightgreen'
  | 'animal'

export interface Palette {
  bg: string
  bgElevated: string
  fg: string
  fgMuted: string
  primary: string
  primaryFg: string
  accent: string
  border: string
  danger: string
  success: string
}

export const PALETTES: Record<ThemeId, { light: Palette; dark: Palette }> = {
  warm: {
    light: {
      bg: '#fff7ed',
      bgElevated: '#ffffff',
      fg: '#7c2d12',
      fgMuted: '#a16207',
      primary: '#ea580c',
      primaryFg: '#ffffff',
      accent: '#fbbf24',
      border: '#fed7aa',
      danger: '#dc2626',
      success: '#16a34a',
    },
    dark: {
      bg: '#1c1917',
      bgElevated: '#292524',
      fg: '#fef3c7',
      fgMuted: '#d6d3d1',
      primary: '#fb923c',
      primaryFg: '#1c1917',
      accent: '#fcd34d',
      border: '#44403c',
      danger: '#f87171',
      success: '#4ade80',
    },
  },
  fresh: {
    light: {
      bg: '#f0f9ff',
      bgElevated: '#ffffff',
      fg: '#0c4a6e',
      fgMuted: '#0369a1',
      primary: '#0284c7',
      primaryFg: '#ffffff',
      accent: '#06b6d4',
      border: '#bae6fd',
      danger: '#dc2626',
      success: '#16a34a',
    },
    dark: {
      bg: '#0c1821',
      bgElevated: '#1e293b',
      fg: '#e0f2fe',
      fgMuted: '#94a3b8',
      primary: '#38bdf8',
      primaryFg: '#0c1821',
      accent: '#22d3ee',
      border: '#334155',
      danger: '#f87171',
      success: '#4ade80',
    },
  },
  cyberpunk: {
    light: {
      bg: '#fef3ff',
      bgElevated: '#ffffff',
      fg: '#2a0a3a',
      fgMuted: '#7a4a8a',
      primary: '#d946ef',
      primaryFg: '#ffffff',
      accent: '#06b6d4',
      border: '#f5d0fe',
      danger: '#e11d48',
      success: '#10b981',
    },
    dark: {
      bg: '#0a0a1a',
      bgElevated: '#15152d',
      fg: '#f0f0ff',
      fgMuted: '#a0a0c0',
      primary: '#ff00ff',
      primaryFg: '#0a0a1a',
      accent: '#00ffff',
      border: '#2a2a4a',
      danger: '#ff0040',
      success: '#00ff80',
    },
  },
  business: {
    light: {
      bg: '#f8fafc',
      bgElevated: '#ffffff',
      fg: '#0f172a',
      fgMuted: '#64748b',
      primary: '#1e40af',
      primaryFg: '#ffffff',
      accent: '#3b82f6',
      border: '#e2e8f0',
      danger: '#dc2626',
      success: '#16a34a',
    },
    dark: {
      bg: '#0f172a',
      bgElevated: '#1e293b',
      fg: '#f1f5f9',
      fgMuted: '#94a3b8',
      primary: '#3b82f6',
      primaryFg: '#0f172a',
      accent: '#60a5fa',
      border: '#334155',
      danger: '#f87171',
      success: '#4ade80',
    },
  },
  cartoon: {
    light: {
      bg: '#fef3c7',
      bgElevated: '#fffbeb',
      fg: '#451a03',
      fgMuted: '#92400e',
      primary: '#f59e0b',
      primaryFg: '#451a03',
      accent: '#ec4899',
      border: '#fde68a',
      danger: '#dc2626',
      success: '#16a34a',
    },
    dark: {
      bg: '#451a03',
      bgElevated: '#78350f',
      fg: '#fef3c7',
      fgMuted: '#fde68a',
      primary: '#fbbf24',
      primaryFg: '#451a03',
      accent: '#f472b6',
      border: '#92400e',
      danger: '#f87171',
      success: '#4ade80',
    },
  },
  minimal: {
    light: {
      bg: '#ffffff',
      bgElevated: '#fafafa',
      fg: '#171717',
      fgMuted: '#737373',
      primary: '#171717',
      primaryFg: '#ffffff',
      accent: '#525252',
      border: '#e5e5e5',
      danger: '#dc2626',
      success: '#16a34a',
    },
    dark: {
      bg: '#0a0a0a',
      bgElevated: '#171717',
      fg: '#fafafa',
      fgMuted: '#a3a3a3',
      primary: '#fafafa',
      primaryFg: '#0a0a0a',
      accent: '#a3a3a3',
      border: '#262626',
      danger: '#f87171',
      success: '#4ade80',
    },
  },
  retro: {
    light: {
      bg: '#fef2e8',
      bgElevated: '#fff7ed',
      fg: '#451a03',
      fgMuted: '#9a3412',
      primary: '#9a3412',
      primaryFg: '#fef2e8',
      accent: '#c2410c',
      border: '#fed7aa',
      danger: '#7f1d1d',
      success: '#15803d',
    },
    dark: {
      bg: '#1c1917',
      bgElevated: '#292524',
      fg: '#fef2e8',
      fgMuted: '#d6d3d1',
      primary: '#ea580c',
      primaryFg: '#1c1917',
      accent: '#fb923c',
      border: '#44403c',
      danger: '#fca5a5',
      success: '#86efac',
    },
  },
  dark: {
    light: {
      bg: '#0a0a0a',
      bgElevated: '#171717',
      fg: '#fafafa',
      fgMuted: '#a3a3a3',
      primary: '#3b82f6',
      primaryFg: '#0a0a0a',
      accent: '#60a5fa',
      border: '#262626',
      danger: '#ef4444',
      success: '#22c55e',
    },
    dark: {
      bg: '#000000',
      bgElevated: '#0a0a0a',
      fg: '#fafafa',
      fgMuted: '#a3a3a3',
      primary: '#3b82f6',
      primaryFg: '#000000',
      accent: '#60a5fa',
      border: '#171717',
      danger: '#ef4444',
      success: '#22c55e',
    },
  },
  lightgreen: {
    light: {
      bg: '#f0fdf4',
      bgElevated: '#ffffff',
      fg: '#14532d',
      fgMuted: '#166534',
      primary: '#16a34a',
      primaryFg: '#ffffff',
      accent: '#84cc16',
      border: '#bbf7d0',
      danger: '#dc2626',
      success: '#15803d',
    },
    dark: {
      bg: '#052e16',
      bgElevated: '#14532d',
      fg: '#dcfce7',
      fgMuted: '#86efac',
      primary: '#22c55e',
      primaryFg: '#052e16',
      accent: '#a3e635',
      border: '#166534',
      danger: '#f87171',
      success: '#4ade80',
    },
  },
  animal: {
    light: {
      bg: '#fff7ed',
      bgElevated: '#ffffff',
      fg: '#5a3a1a',
      fgMuted: '#a16207',
      primary: '#f59e0b',
      primaryFg: '#5a3a1a',
      accent: '#fbbf24',
      border: '#fed7aa',
      danger: '#dc2626',
      success: '#16a34a',
    },
    dark: {
      bg: '#3d2814',
      bgElevated: '#5a3a1a',
      fg: '#fef3c7',
      fgMuted: '#fde68a',
      primary: '#fbbf24',
      primaryFg: '#3d2814',
      accent: '#fcd34d',
      border: '#7c4f1a',
      danger: '#f87171',
      success: '#4ade80',
    },
  },
}

export const ALL_THEME_IDS: ThemeId[] = [
  'warm', 'fresh', 'cyberpunk', 'business', 'cartoon',
  'minimal', 'retro', 'dark', 'lightgreen', 'animal',
]

export const THEME_LABELS: Record<ThemeId, string> = {
  warm: '温暖',
  fresh: '清新',
  cyberpunk: '赛博朋克',
  business: '商务',
  cartoon: '卡通',
  minimal: '极简',
  retro: '复古',
  dark: '暗黑',
  lightgreen: '浅绿',
  animal: '动物森友会',
}

export const THEMES_WITH_FULL_STYLES: ThemeId[] = ['warm', 'cyberpunk', 'minimal', 'lightgreen']
