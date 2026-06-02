import { useCallback } from 'react';
import { generateMusic, MusicGenerationParams } from '../lib/api';
import { useAppStore } from '../stores/appStore';
import { useAsyncAction } from './useAsyncAction';
import { parseAudioResponse, ParsedAudio } from '../lib/audio';

export interface UseCoverGenerationReturn {
  generateCover: (prompt?: string) => Promise<void | undefined>;
  isLoading: boolean;
  error: string | null;
}

interface CoverGenPending {
  parsed: ParsedAudio
  lyrics: string | null
}

export function useCoverGeneration(): UseCoverGenerationReturn {
  const apiKey = useAppStore((state) => state.apiKey);
  const coverFeatureId = useAppStore((state) => state.coverFeatureId);
  const coverPrompt = useAppStore((state) => state.coverPrompt);
  const coverLyrics = useAppStore((state) => state.coverLyrics);

  // The action only validates + parses. Store mutations live in `commit`
  // (called by useAsyncAction only after the runIdRef guard passes) so
  // a slow stale request cannot clobber a newer one's setAudioResult /
  // addToMusicPlaylist writes.
  const action = useCallback(
    async (prompt?: string): Promise<CoverGenPending> => {
      if (!coverFeatureId) {
        throw new Error('请先预处理音频');
      }
      const finalPrompt = prompt || coverPrompt;
      if (!finalPrompt) {
        throw new Error('请输入翻唱风格描述');
      }

      const params: MusicGenerationParams = {
        model: 'music-cover',
        cover_feature_id: coverFeatureId,
        prompt: finalPrompt,
        lyrics: coverLyrics || undefined,
        output_format: 'url',
      };

      const response = await generateMusic(apiKey, params);

      if (response.base_resp && response.base_resp.status_code !== 0) {
        throw new Error(response.base_resp.status_msg || 'Cover generation failed');
      }
      const parsed = parseAudioResponse(response);
      return { parsed, lyrics: coverLyrics || null };
    },
    [apiKey, coverFeatureId, coverPrompt, coverLyrics]
  );

  const commit = useCallback((pending: CoverGenPending) => {
    const { setAudioResult, addToMusicPlaylist, setAudioResultPanelOpen } = useAppStore.getState()
    setAudioResult(pending.parsed.url, pending.parsed.hex, pending.parsed.duration)
    addToMusicPlaylist(pending.parsed.url, pending.parsed.hex, pending.parsed.duration, pending.lyrics)
    setAudioResultPanelOpen(true)
  }, [])

  const { run, isLoading, error } = useAsyncAction<[string?], CoverGenPending>(action, { onSuccess: commit });

  // Preserve the public return shape: callers expect void, not the
  // internal pending object.
  const generateCover = useCallback(
    async (prompt?: string): Promise<void | undefined> => {
      await run(prompt)
    },
    [run]
  )

  return {
    generateCover,
    isLoading,
    error,
  };
}
