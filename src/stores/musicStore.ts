/**
 * 音乐生成状态 store
 */
import { create } from 'zustand'
import type { MusicGenParams, MusicGenResult } from '@/domain/music'

interface MusicState {
  currentParams: MusicGenParams
  currentResult: MusicGenResult | null
  resultBlobUrl: string | null
  history: MusicGenResult[]

  setParams: (params: Partial<MusicGenParams>) => void
  setResult: (result: MusicGenResult | null) => void
  clearResult: () => void
  addToHistory: (result: MusicGenResult) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentParams: {
    prompt: '',
    lyrics: '',
    style: 'pop',
    instrumental: false,
    format: 'url',
  },
  currentResult: null,
  resultBlobUrl: null,
  history: [],

  setParams: (params) => set((s) => ({ currentParams: { ...s.currentParams, ...params } })),

  setResult: (result) => {
    const oldUrl = get().resultBlobUrl
    if (oldUrl) URL.revokeObjectURL(oldUrl)
    set({ currentResult: result })
  },

  clearResult: () => {
    const oldUrl = get().resultBlobUrl
    if (oldUrl) URL.revokeObjectURL(oldUrl)
    set({ currentResult: null, resultBlobUrl: null })
  },

  addToHistory: (result) => set((s) => ({ history: [result, ...s.history].slice(0, 20) })),

  removeFromHistory: (id) => set((s) => ({ history: s.history.filter((r) => r.id !== id) })),

  clearHistory: () => set({ history: [] }),
}))
