const API_BASE = 'https://api.minimaxi.com';

export interface MusicGenerationParams {
  model?: string;
  prompt?: string;
  lyrics?: string;
  stream?: boolean;
  output_format?: 'url' | 'hex';
  audio_setting?: {
    sample_rate?: 16000 | 24000 | 32000 | 44100;
    bitrate?: 32000 | 64000 | 128000 | 256000;
    format?: 'mp3' | 'wav' | 'pcm';
  };
  aigc_watermark?: boolean;
  lyrics_optimizer?: boolean;
  is_instrumental?: boolean;
  audio_url?: string;
  audio_base64?: string;
  cover_feature_id?: string;
}

export interface MusicGenerationResponse {
  data?: {
    status?: number;
    audio?: string;
    audio_url?: string;
  };
  trace_id?: string;
  extra_info?: {
    music_duration?: number;
    music_sample_rate?: number;
    music_channel?: number;
    bitrate?: number;
    music_size?: number;
  };
  analysis_info?: unknown;
  base_resp?: {
    status_code: number;
    status_msg: string;
  };
}

export interface LyricsGenerationResponse {
  song_title?: string;
  style_tags?: string;
  lyrics?: string;
  trace_id?: string;
  base_resp?: {
    status_code: number;
    status_msg: string;
  };
}

export interface CoverPreprocessResponse {
  cover_feature_id?: string;
  lyrics?: string;
  formatted_lyrics?: string;
  structure_result?: string;
  audio_duration?: number;
  audio_url?: string;
  trace_id?: string;
  base_resp?: {
    status_code: number;
    status_msg?: string;
  };
}

export interface ApiError {
  status: number;
  status_text: string;
  trace_id?: string;
}

function parseResponse<T>(response: Response): Promise<T> {
  return response.json().then((data) => {
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        status_text: data.status_text || response.statusText,
        trace_id: data.trace_id,
      };
      throw error;
    }
    return data as T;
  });
}

export async function generateMusic(
  apiKey: string,
  params: MusicGenerationParams
): Promise<MusicGenerationResponse> {
  if (!apiKey) {
    throw { status: 400, status_text: 'API key is required' } as ApiError;
  }

  const response = await fetch(`${API_BASE}/v1/music_generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(params),
  });

  return parseResponse<MusicGenerationResponse>(response);
}

export async function generateLyrics(
  apiKey: string,
  mode: 'write_full_song' | 'edit',
  prompt?: string,
  lyrics?: string,
  title?: string
): Promise<LyricsGenerationResponse> {
  if (!apiKey) {
    throw { status: 400, status_text: 'API key is required' } as ApiError;
  }

  const response = await fetch(`${API_BASE}/v1/lyrics_generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      mode,
      prompt,
      lyrics,
      title,
    }),
  });

  return parseResponse<LyricsGenerationResponse>(response);
}

export async function coverPreprocess(
  apiKey: string,
  audioUrl?: string,
  audioBase64?: string
): Promise<CoverPreprocessResponse> {
  if (!apiKey) {
    throw { status: 400, status_text: 'API key is required' } as ApiError;
  }

  if (!audioUrl && !audioBase64) {
    throw { status: 400, status_text: 'Either audioUrl or audioBase64 is required' } as ApiError;
  }

  const response = await fetch(`${API_BASE}/v1/music_cover_preprocess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'music-cover',
      audio_url: audioUrl,
      audio_base64: audioBase64,
    }),
  });

  return parseResponse<CoverPreprocessResponse>(response);
}
