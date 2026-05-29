import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Mode = 'music' | 'lyrics' | 'cover'
export type Style = 'warm' | 'nature' | 'cyberpunk' | 'blue' | 'cartoon' | 'minimal' | 'retro' | 'dark' | 'pink' | 'animal'

// Style color palettes
export const styleColors = {
  warm: {
    accent: '#e87d1e',
    accentGradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    cardBg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    cardBgDark: 'linear-gradient(135deg, rgba(50,50,50,0.95), rgba(40,40,40,0.95))',
    inputBg: 'rgba(255,255,255,0.9)',
    inputBgDark: 'rgba(50,50,50,0.8)',
    border: '#fed7aa',
    borderDark: '#444',
    label: '#78350f',
    labelDark: '#ccc',
    sidebarActive: '#e87d1e',
  },
  nature: {
    accent: '#22c55e',
    accentGradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    cardBg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    cardBgDark: 'linear-gradient(135deg, rgba(30,50,40,0.95), rgba(25,45,35,0.95))',
    inputBg: 'rgba(255,255,255,0.9)',
    inputBgDark: 'rgba(40,60,50,0.8)',
    border: '#bbf7d0',
    borderDark: '#444',
    label: '#166534',
    labelDark: '#ccc',
    sidebarActive: '#22c55e',
  },
  cyberpunk: {
    accent: '#8b5cf6',
    accentGradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    cardBg: 'linear-gradient(135deg, #1e1b4b, #172554)',
    cardBgDark: 'linear-gradient(135deg, rgba(30,25,60,0.95), rgba(20,35,70,0.95))',
    inputBg: 'rgba(30,30,60,0.9)',
    inputBgDark: 'rgba(30,25,60,0.8)',
    border: '#4c1d95',
    borderDark: '#4c1d95',
    label: '#c4b5fd',
    labelDark: '#c4b5fd',
    sidebarActive: '#8b5cf6',
  },
  blue: {
    accent: '#3b82f6',
    accentGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    cardBg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    cardBgDark: 'linear-gradient(135deg, rgba(30,40,60,0.95), rgba(25,35,55,0.95))',
    inputBg: 'rgba(255,255,255,0.9)',
    inputBgDark: 'rgba(30,40,60,0.8)',
    border: '#bfdbfe',
    borderDark: '#444',
    label: '#1e40af',
    labelDark: '#ccc',
    sidebarActive: '#3b82f6',
  },
  cartoon: {
    accent: '#eab308',
    accentGradient: 'linear-gradient(135deg, #facc15, #eab308)',
    cardBg: 'linear-gradient(135deg, #fef9c3, #fef08a)',
    cardBgDark: 'linear-gradient(135deg, rgba(50,50,30,0.95), rgba(40,40,25,0.95))',
    inputBg: 'rgba(255,255,255,0.9)',
    inputBgDark: 'rgba(50,50,30,0.8)',
    border: '#fde047',
    borderDark: '#444',
    label: '#713f12',
    labelDark: '#ccc',
    sidebarActive: '#eab308',
  },
  minimal: {
    accent: '#404040',
    accentGradient: 'linear-gradient(135deg, #404040, #262626)',
    cardBg: 'linear-gradient(135deg, #fafafa, #f5f5f5)',
    cardBgDark: 'linear-gradient(135deg, rgba(40,40,40,0.95), rgba(30,30,30,0.95))',
    inputBg: 'rgba(255,255,255,0.9)',
    inputBgDark: 'rgba(40,40,40,0.8)',
    border: '#d4d4d4',
    borderDark: '#444',
    label: '#171717',
    labelDark: '#ccc',
    sidebarActive: '#404040',
  },
  retro: {
    accent: '#c2410c',
    accentGradient: 'linear-gradient(135deg, #fb923c, #ea580c)',
    cardBg: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
    cardBgDark: 'linear-gradient(135deg, rgba(50,35,30,0.95), rgba(40,30,25,0.95))',
    inputBg: 'rgba(255,255,255,0.9)',
    inputBgDark: 'rgba(50,35,30,0.8)',
    border: '#fed7aa',
    borderDark: '#444',
    label: '#7c2d12',
    labelDark: '#ccc',
    sidebarActive: '#c2410c',
  },
  dark: {
    accent: '#71717a',
    accentGradient: 'linear-gradient(135deg, #71717a, #52525b)',
    cardBg: 'linear-gradient(135deg, #27272a, #18181b)',
    cardBgDark: 'linear-gradient(135deg, rgba(40,40,40,0.95), rgba(30,30,30,0.95))',
    inputBg: 'rgba(50,50,50,0.9)',
    inputBgDark: 'rgba(50,50,50,0.8)',
    border: '#3f3f46',
    borderDark: '#444',
    label: '#f4f4f5',
    labelDark: '#ccc',
    sidebarActive: '#71717a',
  },
  pink: {
    accent: '#86efac',
    accentGradient: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
    cardBg: 'linear-gradient(135deg, #f5fffe, #e6f9f0)',
    cardBgDark: 'linear-gradient(135deg, rgba(40,60,50,0.95), rgba(35,50,45,0.95))',
    inputBg: 'rgba(255,255,255,0.95)',
    inputBgDark: 'rgba(40,60,50,0.8)',
    border: '#d1fae5',
    borderDark: '#444',
    label: '#065f46',
    labelDark: '#ccc',
    sidebarActive: '#86efac',
  },
  animal: {
    accent: '#19c8b9',
    accentGradient: 'linear-gradient(135deg, #19c8b9, #3dd4c6)',
    cardBg: 'linear-gradient(135deg, #f8f8f0, #f0e8d8)',
    cardBgDark: 'linear-gradient(135deg, rgba(60,55,50,0.95), rgba(50,45,40,0.95))',
    inputBg: 'rgba(247,243,223,0.9)',
    inputBgDark: 'rgba(60,55,50,0.8)',
    border: '#c4b89e',
    borderDark: '#5a5550',
    label: '#794f27',
    labelDark: '#f0e8d8',
    sidebarActive: '#19c8b9',
  },
} as const

interface AppState {
  // Theme
  isDark: boolean
  setIsDark: (isDark: boolean) => void

  // Style
  style: Style
  setStyle: (style: Style) => void

  // API Key
  apiKey: string
  setApiKey: (key: string) => void

  // Mode
  mode: Mode
  setMode: (mode: Mode) => void

  // Lyrics Panel
  lyricsPanelOpen: boolean
  setLyricsPanelOpen: (open: boolean) => void

  // Lyrics Example Panel
  lyricsExampleOpen: boolean
  setLyricsExampleOpen: (open: boolean) => void

  // Audio Result
  audioUrl: string | null
  audioHex: string | null
  musicDuration: number | null
  setAudioResult: (url: string | null, hex: string | null, duration: number | null) => void

  // Audio Result Panel - controls the floating panel visibility
  audioResultPanelOpen: boolean
  setAudioResultPanelOpen: (open: boolean) => void

  // Lyrics Panel - controls the lyrics floating panel visibility
  lyricsPanelShow: boolean
  setLyricsPanelShow: (show: boolean) => void

  // Music Playlist - stores generated music history
  musicPlaylist: Array<{ url: string; hex: string | null; duration: number | null; createdAt: number; lyrics?: string | null }>
  addToMusicPlaylist: (url: string, hex: string | null, duration: number | null, lyrics?: string | null) => void
  removeFromMusicPlaylist: (createdAt: number) => void
  clearMusicPlaylist: () => void
  cleanupBlobUrl: (url: string | null) => void

  // Generated Lyrics
  generatedLyrics: string | null
  setGeneratedLyrics: (lyrics: string | null) => void

  // Pending Lyrics to apply to music generator
  pendingLyricsToApply: string | null
  setPendingLyricsToApply: (lyrics: string | null) => void

  // Generated Lyrics Meta
  generatedLyricsTitle: string | null
  setGeneratedLyricsTitle: (title: string | null) => void
  generatedLyricsStyleTags: string | null
  setGeneratedLyricsStyleTags: (tags: string | null) => void

  // Cover Feature
  coverFeatureId: string | null
  setCoverFeatureId: (featureId: string | null) => void

  // Cover Lyrics
  coverLyrics: string | null
  setCoverLyrics: (lyrics: string | null) => void

  // Cover Prompt
  coverPrompt: string
  setCoverPrompt: (prompt: string) => void

  // Clear audio result
  clearAudioResult: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      isDark: false,
      setIsDark: (isDark) => {
        document.body.style.backgroundColor = isDark ? '#1a1a1a' : '#f8f8f0'
        document.body.style.color = isDark ? '#eee' : '#333'
        document.body.style.transition = 'all 0.3s ease'
        set({ isDark })
      },

      // Style
      style: 'warm' as Style,
      setStyle: (style) => set({ style }),

      // API Key
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      // Mode
      mode: 'music',
      setMode: (mode) => set({ mode }),

      // Lyrics Panel
      lyricsPanelOpen: false,
      setLyricsPanelOpen: (open) => set({ lyricsPanelOpen: open }),

      // Lyrics Example Panel
      lyricsExampleOpen: false,
      setLyricsExampleOpen: (open) => set({ lyricsExampleOpen: open }),

      // Audio Result
      audioUrl: null,
      audioHex: null,
      musicDuration: null,
      setAudioResult: (url, hex, duration) =>
        set({ audioUrl: url, audioHex: hex, musicDuration: duration }),

      // Audio Result Panel
      audioResultPanelOpen: false,
      setAudioResultPanelOpen: (open) => set({ audioResultPanelOpen: open }),

      // Lyrics Panel
      lyricsPanelShow: false,
      setLyricsPanelShow: (show) => set({ lyricsPanelShow: show }),

      // Music Playlist
      // Note: hex is not persisted as it can be very large and exceed localStorage quota
      musicPlaylist: [],
      addToMusicPlaylist: (url, _hex, duration, lyrics) => set((state) => {
        // Don't persist large hex strings - only keep URL and metadata
        const playlistItem = { url, hex: null, duration, createdAt: Date.now(), lyrics }
        return {
          musicPlaylist: [playlistItem, ...state.musicPlaylist].slice(0, 50)
        }
      }),
      removeFromMusicPlaylist: (createdAt) => set((state) => ({
        musicPlaylist: state.musicPlaylist.filter((track) => track.createdAt !== createdAt)
      })),
      clearMusicPlaylist: () => set({ musicPlaylist: [] }),
      cleanupBlobUrl: (url) => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      },

      // Generated Lyrics
      generatedLyrics: null,
      setGeneratedLyrics: (lyrics) => set({ generatedLyrics: lyrics }),

      // Pending Lyrics to apply to music generator
      pendingLyricsToApply: null,
      setPendingLyricsToApply: (lyrics) => set({ pendingLyricsToApply: lyrics }),

      // Generated Lyrics Meta
      generatedLyricsTitle: null,
      setGeneratedLyricsTitle: (title) => set({ generatedLyricsTitle: title }),
      generatedLyricsStyleTags: null,
      setGeneratedLyricsStyleTags: (tags) => set({ generatedLyricsStyleTags: tags }),

      // Cover Feature
      coverFeatureId: null,
      setCoverFeatureId: (featureId) => set({ coverFeatureId: featureId }),

      // Cover Lyrics
      coverLyrics: null,
      setCoverLyrics: (lyrics) => set({ coverLyrics: lyrics }),

      // Cover Prompt
      coverPrompt: '',
      setCoverPrompt: (prompt) => set({ coverPrompt: prompt }),

      // Clear audio result
      clearAudioResult: () =>
        set({ audioUrl: null, audioHex: null, musicDuration: null }),
    }),
    {
      name: 'music-master-storage',
      partialize: (state) => ({
        mode: state.mode,
        isDark: state.isDark,
        style: state.style,
        musicPlaylist: state.musicPlaylist,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState>
        return {
          ...currentState,
          mode: persisted.mode ?? currentState.mode,
          isDark: persisted.isDark ?? currentState.isDark,
          style: persisted.style ?? currentState.style,
          musicPlaylist: persisted.musicPlaylist ?? currentState.musicPlaylist,
          apiKey: '',
        }
      },
    }
  )
)
