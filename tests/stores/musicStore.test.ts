import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMusicStore } from '@/stores/musicStore'

describe('useMusicStore', () => {
  beforeEach(() => {
    useMusicStore.setState({
      currentParams: { prompt: '', lyrics: '', style: 'pop', instrumental: false, format: 'url' },
      currentResult: null,
      resultBlobUrl: null,
      history: [],
    })
  })

  it('merges params', () => {
    const { setParams } = useMusicStore.getState()
    setParams({ prompt: 'test', style: 'rock' })
    const params = useMusicStore.getState().currentParams
    expect(params.prompt).toBe('test')
    expect(params.style).toBe('rock')
    expect(params.format).toBe('url')
  })

  it('adds to history (max 20)', () => {
    const { addToHistory } = useMusicStore.getState()
    for (let i = 0; i < 25; i++) {
      addToHistory({
        id: `m_${i}`,
        audioUrl: 'data:',
        audioHex: '',
        duration: 1,
        format: 'url',
        createdAt: Date.now(),
      })
    }
    expect(useMusicStore.getState().history).toHaveLength(20)
  })

  it('removes from history', () => {
    const { addToHistory, removeFromHistory } = useMusicStore.getState()
    addToHistory({ id: 'a', audioUrl: '', audioHex: '', duration: 1, format: 'url', createdAt: 0 })
    addToHistory({ id: 'b', audioUrl: '', audioHex: '', duration: 1, format: 'url', createdAt: 0 })
    removeFromHistory('a')
    expect(useMusicStore.getState().history.map((h) => h.id)).toEqual(['b'])
  })

  it('revokes blob URL on clearResult', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    useMusicStore.setState({ resultBlobUrl: 'blob:abc' })
    useMusicStore.getState().clearResult()
    expect(revokeSpy).toHaveBeenCalledWith('blob:abc')
    revokeSpy.mockRestore()
  })
})
