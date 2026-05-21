import { useState, useCallback } from 'react';
import { generateLyrics, LyricsGenerationResponse } from '../lib/api';
import { useAppStore } from '../stores/appStore';

export type LyricsMode = 'text_to_lyrics' | 'audio_to_lyrics';

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
      
      if (response.status !== 0 && response.status !== 200) {
        throw new Error(response.status_text || 'Lyrics generation failed');
      }
      
      if (!response.data) {
        throw new Error('No data in response');
      }
      
      const generatedLyricsText = response.data.lyrics || null;
      
      if (generatedLyricsText) {
        setGeneratedLyrics(generatedLyricsText);
        setLyricsPanelOpen(true);
      }
      
      return generatedLyricsText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lyrics generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, setGeneratedLyrics, setLyricsPanelOpen]);

  return {
    generate,
    isLoading,
    error,
  };
}
