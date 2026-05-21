const API_BASE = 'https://api.minimaxi.com';

export interface MusicGenerationParams {
  model?: string;
  title?: string;
  prompt?: string;
  lyrics?: string;
  style?: string;
  tags?: string[];
 instrumental?: boolean;
}

export interface MusicGenerationResponse {
  status: number;
  status_text: string;
  trace_id?: string;
  data?: {
    audio_url?: string;
    audio_hex?: string;
    duration?: number;
    title?: string;
  };
}

export interface LyricsGenerationResponse {
  status: number;
  status_text: string;
  trace_id?: string;
  data?: {
    lyrics?: string;
    title?: string;
  };
}

export interface CoverPreprocessResponse {
  status: number;
  status_text: string;
  trace_id?: string;
  data?: {
    feature_id?: string;
    lyrics?: string;
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
  mode: 'text_to_lyrics' | 'audio_to_lyrics',
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
      audio_url: audioUrl,
      audio_base64: audioBase64,
    }),
  });

  return parseResponse<CoverPreprocessResponse>(response);
}
