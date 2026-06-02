const API_BASE = 'https://api.minimaxi.com';
const REQUEST_TIMEOUT_MS = 300000; // 5 minutes for music generation

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

export class ApiError extends Error {
  status: number;
  trace_id?: string;
  constructor(status: number, status_text: string, trace_id?: string) {
    super(status_text);
    this.name = 'ApiError';
    this.status = status;
    this.trace_id = trace_id;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'status_text' in error &&
    typeof (error as { status_text?: unknown }).status_text === 'string'
  ) {
    return (error as { status_text: string }).status_text;
  }

  return fallback;
}

interface ResponseErrorBody {
  status_text?: string;
  status_msg?: string;
  message?: string;
  trace_id?: string;
  base_resp?: {
    status_msg?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readErrorBody(data: unknown): ResponseErrorBody {
  if (!isRecord(data)) {
    return {};
  }

  const baseResp = isRecord(data.base_resp) ? data.base_resp : undefined;
  return {
    status_text: typeof data.status_text === 'string' ? data.status_text : undefined,
    status_msg: typeof data.status_msg === 'string' ? data.status_msg : undefined,
    message: typeof data.message === 'string' ? data.message : undefined,
    trace_id: typeof data.trace_id === 'string' ? data.trace_id : undefined,
    base_resp: baseResp
      ? {
          status_msg: typeof baseResp.status_msg === 'string' ? baseResp.status_msg : undefined,
        }
      : undefined,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new ApiError(
          response.status,
          text || response.statusText || 'Request failed'
        );
      }

      throw new ApiError(
        response.status,
        'Invalid JSON response from API'
      );
    }
  }

  if (!response.ok) {
    const errorBody = readErrorBody(data);
    throw new ApiError(
      response.status,
      errorBody.status_text ||
        errorBody.status_msg ||
        errorBody.base_resp?.status_msg ||
        errorBody.message ||
        response.statusText ||
        'Request failed',
      errorBody.trace_id
    );
  }

  return data as T;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout - please try again');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateMusic(
  apiKey: string,
  params: MusicGenerationParams
): Promise<MusicGenerationResponse> {
  if (!apiKey) {
    throw new ApiError(400, 'API key is required');
  }

  const response = await fetchWithTimeout(`${API_BASE}/v1/music_generation`, {
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
    throw new ApiError(400, 'API key is required');
  }

  // Validate edit mode has lyrics
  if (mode === 'edit' && !lyrics?.trim()) {
    throw new ApiError(400, 'Lyrics content is required for edit mode');
  }

  const response = await fetchWithTimeout(`${API_BASE}/v1/lyrics_generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      mode,
      prompt: prompt || undefined,
      lyrics: lyrics || undefined,
      title: title || undefined,
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
    throw new ApiError(400, 'API key is required');
  }

  if (!audioUrl && !audioBase64) {
    throw new ApiError(400, 'Either audioUrl or audioBase64 is required');
  }

  const response = await fetchWithTimeout(`${API_BASE}/v1/music_cover_preprocess`, {
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
