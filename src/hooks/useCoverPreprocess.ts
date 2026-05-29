import { useState, useCallback } from 'react';
import { coverPreprocess, CoverPreprocessResponse, getApiErrorMessage } from '../lib/api';
import { useAppStore } from '../stores/appStore';

export interface UseCoverPreprocessReturn {
  preprocess: (audioUrl?: string, audioBase64?: string) => Promise<{
    featureId: string | null;
    lyrics: string | null;
  }>;
  isLoading: boolean;
  error: string | null;
}

export function useCoverPreprocess(): UseCoverPreprocessReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiKey = useAppStore((state) => state.apiKey);
  const setCoverFeatureId = useAppStore((state) => state.setCoverFeatureId);
  const setCoverLyrics = useAppStore((state) => state.setCoverLyrics);

  const preprocess = useCallback(async (
    audioUrl?: string,
    audioBase64?: string
  ): Promise<{
    featureId: string | null;
    lyrics: string | null;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: CoverPreprocessResponse = await coverPreprocess(
        apiKey,
        audioUrl,
        audioBase64
      );

      if (response.base_resp && response.base_resp.status_code !== 0) {
        throw new Error(response.base_resp.status_msg || 'Cover preprocess failed');
      }

      const featureId = response.cover_feature_id || null;
      const lyrics = response.lyrics || response.formatted_lyrics || null;
      
      setCoverFeatureId(featureId);
      setCoverLyrics(lyrics);
      
      return { featureId, lyrics };
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, 'Cover preprocess failed');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, setCoverFeatureId, setCoverLyrics]);

  return {
    preprocess,
    isLoading,
    error,
  };
}
