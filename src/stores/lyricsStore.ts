/**
 * 歌词生成状态 store
 */
import { create } from 'zustand'
import type { LyricsGenParams, LyricsResult, LyricsStyle } from '@/domain/lyrics'

interface LyricsState {
  params: LyricsGenParams
  current: LyricsResult | null
  history: LyricsResult[]

  setParams: (params: Partial<LyricsGenParams>) => void
  setStyle: (style: LyricsStyle) => void
  setMode: (mode: 'full' | 'continue') => void
  setCurrent: (result: LyricsResult | null) => void
  addToHistory: (result: LyricsResult) => void
  clearHistory: () => void
}

export const useLyricsStore = create<LyricsState>((set) => ({
  params: {
    prompt: '',
    mode: 'full',
    style: 'pop',
  },
  current: null,
  history: [],

  setParams: (params) => set((s) => ({ params: { ...s.params, ...params } })),
  setStyle: (style) => set((s) => ({ params: { ...s.params, style } })),
  setMode: (mode) => set((s) => ({ params: { ...s.params, mode } })),
  setCurrent: (current) => set({ current }),
  addToHistory: (result) => set((s) => ({ history: [result, ...s.history].slice(0, 20) })),
  clearHistory: () => set({ history: [] }),
}))
