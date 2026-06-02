import { useCallback } from 'react';
import { coverPreprocess, CoverPreprocessResponse } from '../lib/api';
import { useAppStore } from '../stores/appStore';
import { useAsyncAction } from './useAsyncAction';

export interface CoverPreprocessResult {
  featureId: string | null
  lyrics: string | null
}

export interface UseCoverPreprocessReturn {
  preprocess: (audioUrl?: string, audioBase64?: string) => Promise<CoverPreprocessResult | undefined>;
  isLoading: boolean;
  error: string | null;
}

export function useCoverPreprocess(): UseCoverPreprocessReturn {
  const apiKey = useAppStore((state) => state.apiKey);

  // The action only validates the API response. Store mutations live in
  // `commit` (called by useAsyncAction only after the runIdRef guard passes)
  // so a slow stale preprocess cannot clobber a newer one's store values.
  const action = useCallback(
    async (audioUrl?: string, audioBase64?: string): Promise<CoverPreprocessResult> => {
      const response: CoverPreprocessResponse = await coverPreprocess(apiKey, audioUrl, audioBase64);

      if (response.base_resp && response.base_resp.status_code !== 0) {
        throw new Error(response.base_resp.status_msg || 'Cover preprocess failed');
      }

      const featureId = response.cover_feature_id || null;
      const lyrics = response.lyrics || response.formatted_lyrics || null;
      return { featureId, lyrics };
    },
    [apiKey]
  );

  const commit = useCallback((pending: CoverPreprocessResult) => {
    const { setCoverFeatureId, setCoverLyrics } = useAppStore.getState();
    setCoverFeatureId(pending.featureId);
    setCoverLyrics(pending.lyrics);
  }, []);

  const { run, isLoading, error } = useAsyncAction<[string?, string?], CoverPreprocessResult>(action, { onSuccess: commit });

  return {
    preprocess: run,
    isLoading,
    error,
  };
}
