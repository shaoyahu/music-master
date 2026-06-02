import { useCallback } from 'react';
import { generateLyrics, LyricsGenerationResponse } from '../lib/api';
import { useAppStore } from '../stores/appStore';
import { useAsyncAction } from './useAsyncAction';

export type LyricsMode = 'write_full_song' | 'edit';

interface LyricsGenResult {
  text: string | null
  title: string | null
  styleTags: string | null
}

export interface UseLyricsGenerationReturn {
  generate: (
    mode: LyricsMode,
    prompt?: string,
    lyrics?: string,
    title?: string
  ) => Promise<string | null | undefined>;
  isLoading: boolean;
  error: string | null;
}

export function useLyricsGeneration(): UseLyricsGenerationReturn {
  const apiKey = useAppStore((state) => state.apiKey);

  // The action only validates the API response. Store mutations live in
  // `commit` (called by useAsyncAction only after the runIdRef guard passes)
  // so a slow stale request cannot clobber a newer one's lyrics panel state.
  const action = useCallback(
    async (
      mode: LyricsMode,
      prompt?: string,
      lyrics?: string,
      title?: string
    ): Promise<LyricsGenResult> => {
      const response: LyricsGenerationResponse = await generateLyrics(apiKey, mode, prompt, lyrics, title);

      if (response.base_resp && response.base_resp.status_code !== 0) {
        throw new Error(response.base_resp.status_msg || 'Lyrics generation failed');
      }

      return {
        text: response.lyrics || null,
        title: response.song_title || null,
        styleTags: response.style_tags || null,
      };
    },
    [apiKey]
  );

  const commit = useCallback((pending: LyricsGenResult) => {
    if (!pending.text) return;
    const {
      setGeneratedLyrics,
      setGeneratedLyricsTitle,
      setGeneratedLyricsStyleTags,
      setLyricsPanelOpen,
    } = useAppStore.getState();
    setGeneratedLyrics(pending.text);
    setGeneratedLyricsTitle(pending.title);
    setGeneratedLyricsStyleTags(pending.styleTags);
    setLyricsPanelOpen(true);
  }, []);

  const { run, isLoading, error } = useAsyncAction<[LyricsMode, string?, string?, string?], LyricsGenResult>(
    action,
    { onSuccess: commit }
  );

  // Preserve the public return shape: callers expect the lyrics text
  // (or undefined on stale), not the internal result object.
  const generate = useCallback(
    async (
      mode: LyricsMode,
      prompt?: string,
      lyrics?: string,
      title?: string
    ): Promise<string | null | undefined> => {
      const result = await run(mode, prompt, lyrics, title);
      return result?.text;
    },
    [run]
  );

  return {
    generate,
    isLoading,
    error,
  };
}
