import { useCallback } from 'react';
import { generateMusic, MusicGenerationParams } from '../lib/api';
import { useAppStore } from '../stores/appStore';
import { useAsyncAction } from './useAsyncAction';
import { parseAudioResponse, ParsedAudio } from '../lib/audio';

export interface UseMusicGenerationReturn {
  generate: (params: MusicGenerationParams) => Promise<string | null | undefined>;
  isLoading: boolean;
  error: string | null;
}

interface MusicGenPending {
  parsed: ParsedAudio
  lyrics: string | null
}

export function useMusicGeneration(): UseMusicGenerationReturn {
  const apiKey = useAppStore((state) => state.apiKey);

  // The action only validates the API response and parses the audio
  // payload — it does NOT touch the store. The store mutation lives in
  // `commit` below, which `useAsyncAction` invokes only after the
  // runIdRef guard passes. That means a slow stale action can never
  // clobber a newer run's `setAudioResult` / `addToMusicPlaylist` calls.
  const action = useCallback(
    async (params: MusicGenerationParams): Promise<MusicGenPending> => {
      // Clear previous audio result before kicking off the request.
      useAppStore.getState().clearAudioResult()
      const response = await generateMusic(apiKey, params)
      if (response.base_resp && response.base_resp.status_code !== 0) {
        throw new Error(response.base_resp.status_msg || 'Music generation failed');
      }
      const parsed = parseAudioResponse(response)
      return { parsed, lyrics: params.lyrics || null }
    },
    [apiKey]
  )

  // Race-safe commit: useAsyncAction calls this only when this run is
  // still the latest (runIdRef matches), so a late-resolving older
  // request cannot overwrite the newer one.
  const commit = useCallback((pending: MusicGenPending) => {
    const { setAudioResult, addToMusicPlaylist, setAudioResultPanelOpen } = useAppStore.getState()
    setAudioResult(pending.parsed.url, pending.parsed.hex, pending.parsed.duration)
    addToMusicPlaylist(pending.parsed.url, pending.parsed.hex, pending.parsed.duration, pending.lyrics)
    setAudioResultPanelOpen(true)
  }, [])

  const { run, isLoading, error } = useAsyncAction<[MusicGenerationParams], MusicGenPending>(action, { onSuccess: commit })

  // Preserve the public return shape: callers expect a URL, not the
  // internal pending object.
  const generate = useCallback(
    async (params: MusicGenerationParams): Promise<string | null | undefined> => {
      const pending = await run(params)
      return pending?.parsed.url
    },
    [run]
  )

  return {
    generate,
    isLoading,
    error,
  };
}
