/**
 * 翻唱状态 store
 */
import { create } from 'zustand'
import type { CoverPreprocessResult, CoverGenResult } from '@/domain/cover'

interface CoverState {
  fileName: string | null
  fileSize: number
  preprocessResult: CoverPreprocessResult | null
  genResult: CoverGenResult | null
  resultBlobUrl: string | null
  prompt: string

  setFile: (name: string | null, size: number) => void
  setPrompt: (prompt: string) => void
  setPreprocessResult: (result: CoverPreprocessResult | null) => void
  setGenResult: (result: CoverGenResult | null) => void
  clearAll: () => void
}

export const useCoverStore = create<CoverState>((set, get) => ({
  fileName: null,
  fileSize: 0,
  preprocessResult: null,
  genResult: null,
  resultBlobUrl: null,
  prompt: '',

  setFile: (fileName, fileSize) => set({ fileName, fileSize }),
  setPrompt: (prompt) => set({ prompt }),

  setPreprocessResult: (preprocessResult) => set({ preprocessResult }),

  setGenResult: (genResult) => {
    const oldUrl = get().resultBlobUrl
    if (oldUrl) URL.revokeObjectURL(oldUrl)
    set({ genResult })
  },

  clearAll: () => {
    const oldUrl = get().resultBlobUrl
    if (oldUrl) URL.revokeObjectURL(oldUrl)
    set({ fileName: null, fileSize: 0, preprocessResult: null, genResult: null, resultBlobUrl: null, prompt: '' })
  },
}))
