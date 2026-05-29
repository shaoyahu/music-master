import { useState, useCallback } from 'react';
import { generateLyrics, getApiErrorMessage, LyricsGenerationResponse } from '../lib/api';
import { useAppStore } from '../stores/appStore';

export type LyricsMode = 'write_full_song' | 'edit';

export interface UseLyricsGenerationReturn {
  generate: (
    mode: LyricsMode,
    prompt?: string,
    lyrics?: string,
    title?: string
  ) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useLyricsGeneration(): UseLyricsGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiKey = useAppStore((state) => state.apiKey);
  const setGeneratedLyrics = useAppStore((state) => state.setGeneratedLyrics);
  const setGeneratedLyricsTitle = useAppStore((state) => state.setGeneratedLyricsTitle);
  const setGeneratedLyricsStyleTags = useAppStore((state) => state.setGeneratedLyricsStyleTags);
  const setLyricsPanelOpen = useAppStore((state) => state.setLyricsPanelOpen);

  const generate = useCallback(async (
    mode: LyricsMode,
    prompt?: string,
    lyrics?: string,
    title?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: LyricsGenerationResponse = await generateLyrics(
        apiKey,
        mode,
        prompt,
        lyrics,
        title
      );
      
      if (response.base_resp && response.base_resp.status_code !== 0) {
        throw new Error(response.base_resp.status_msg || 'Lyrics generation failed');
      }

      const generatedLyricsText = response.lyrics || null;

      if (generatedLyricsText) {
        setGeneratedLyrics(generatedLyricsText);
        setGeneratedLyricsTitle(response.song_title || null);
        setGeneratedLyricsStyleTags(response.style_tags || null);
        setLyricsPanelOpen(true);
      }
      
      return generatedLyricsText;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, 'Lyrics generation failed');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, setGeneratedLyrics, setGeneratedLyricsTitle, setGeneratedLyricsStyleTags, setLyricsPanelOpen]);

  return {
    generate,
    isLoading,
    error,
  };
}
