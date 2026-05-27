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

      // Check API-level error
      if (response.base_resp && response.base_resp.status_code !== 0) {
        throw new Error(response.base_resp.status_msg || 'Music generation failed');
      }

      if (!response.data) {
        throw new Error('接口返回数据格式异常，请检查网络或联系开发者');
      }

      const audioData = response.data;

      // Check if generation is complete (status 2 = complete, 1 = processing)
      if (audioData.status === 1) {
        throw new Error('音乐仍在生成中，请稍后重试');
      }

      let audioUrl: string | null = null;
      let audioHex: string | null = null;

      // Handle audio data - check if it's a URL or hex data
      if (audioData.audio) {
        if (audioData.audio.startsWith('http://') || audioData.audio.startsWith('https://')) {
          // It's already a URL, use directly
          audioUrl = audioData.audio;
        } else {
          // It's hex data, convert to audio URL
          audioHex = audioData.audio;
          audioUrl = hexToAudioUrl(audioData.audio);
        }
      }
      // Handle url format - use directly
      else if (audioData.audio_url) {
        audioUrl = audioData.audio_url;
      } else {
        throw new Error('未获取到音频数据，请重试');
      }

      setAudioResult(
        audioUrl,
        audioHex,
        response.extra_info?.music_duration || null
      );
      console.log('[useMusicGeneration] setAudioResult called', { audioUrl, hasHex: !!audioHex });

      // Add to playlist and auto open the audio result panel when music is generated
      useAppStore.getState().addToMusicPlaylist(audioUrl, audioHex, response.extra_info?.music_duration || null, params.lyrics || null);
      useAppStore.getState().setAudioResultPanelOpen(true);

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
