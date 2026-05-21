import { useState, useCallback } from 'react';
import { generateMusic, MusicGenerationParams, MusicGenerationResponse } from '../lib/api';
import { useAppStore } from '../stores/appStore';

export interface UseMusicGenerationReturn {
  generate: (params: MusicGenerationParams) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

function hexToAudioUrl(hex: string): string {
  const binaryString = hex
    .replace(/\s/g, '')
    .match(/.{1,2}/g)
    ?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
    .join('') || '';
  
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const blob = new Blob([bytes], { type: 'audio/mpeg' });
  return URL.createObjectURL(blob);
}

export function useMusicGeneration(): UseMusicGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiKey = useAppStore((state) => state.apiKey);
  const setAudioResult = useAppStore((state) => state.setAudioResult);
  const clearAudioResult = useAppStore((state) => state.clearAudioResult);

  const generate = useCallback(async (params: MusicGenerationParams): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    // Clear previous audio result
    clearAudioResult();
    
    try {
      const response: MusicGenerationResponse = await generateMusic(apiKey, params);
      
      if (response.status !== 0 && response.status !== 200) {
        throw new Error(response.status_text || 'Music generation failed');
      }
      
      if (!response.data) {
        throw new Error('No data in response');
      }
      
      let audioUrl: string | null = null;
      
      // If we have a hex string, convert it to an audio URL
      if (response.data.audio_hex) {
        audioUrl = hexToAudioUrl(response.data.audio_hex);
      } else if (response.data.audio_url) {
        audioUrl = response.data.audio_url;
      }
      
      setAudioResult(
        audioUrl,
        response.data.audio_hex || null,
        response.data.duration || null
      );
      
      return audioUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Music generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, setAudioResult, clearAudioResult]);

  return {
    generate,
    isLoading,
    error,
  };
}
