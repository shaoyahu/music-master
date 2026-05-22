import { useState, useCallback } from 'react';
import { generateMusic, MusicGenerationParams } from '../lib/api';
import { useAppStore } from '../stores/appStore';

export interface UseCoverGenerationReturn {
  generateCover: (prompt?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useCoverGeneration(): UseCoverGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = useAppStore((state) => state.apiKey);
  const coverFeatureId = useAppStore((state) => state.coverFeatureId);
  const coverPrompt = useAppStore((state) => state.coverPrompt);
  const coverLyrics = useAppStore((state) => state.coverLyrics);
  const setAudioResult = useAppStore((state) => state.setAudioResult);

  const generateCover = useCallback(async (prompt?: string) => {
    if (!coverFeatureId) {
      setError('请先预处理音频');
      return;
    }

    const finalPrompt = prompt || coverPrompt;
    if (!finalPrompt) {
      setError('请输入翻唱风格描述');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: MusicGenerationParams = {
        model: 'music-cover',
        cover_feature_id: coverFeatureId,
        prompt: finalPrompt,
        lyrics: coverLyrics || undefined,
        output_format: 'url',
      };

      const response = await generateMusic(apiKey, params);

      // status: 1 = processing, 2 = completed
      if (response.data?.status === 1) {
        throw new Error('音乐生成还在处理中，请稍后再试');
      }

      const audioUrl = response.data?.audio_url || null;
      const audioHex = response.data?.audio || null;
      const duration = response.extra_info?.music_duration || null;

      if (!audioUrl && !audioHex) {
        throw new Error('未收到音频数据，请重试');
      }

      setAudioResult(audioUrl, audioHex, duration);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cover generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, coverFeatureId, coverPrompt, coverLyrics, setAudioResult]);

  return {
    generateCover,
    isLoading,
    error,
  };
}