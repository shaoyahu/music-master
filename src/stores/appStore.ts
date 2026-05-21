import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Mode = 'music' | 'lyrics' | 'cover'
export type Style = 'warm' | 'nature' | 'cyberpunk'

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

  // Generated Lyrics
  generatedLyrics: string | null
  setGeneratedLyrics: (lyrics: string | null) => void

  // Cover Feature
  coverFeatureId: string | null
  setCoverFeatureId: (featureId: string | null) => void

  // Cover Lyrics
  coverLyrics: string | null
  setCoverLyrics: (lyrics: string | null) => void

  // Clear audio result
  clearAudioResult: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      isDark: false,
      setIsDark: (isDark) => {
        document.body.style.backgroundColor = isDark ? '#1a1a1a' : '#fef7f0'
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

      // Generated Lyrics
      generatedLyrics: null,
      setGeneratedLyrics: (lyrics) => set({ generatedLyrics: lyrics }),

      // Cover Feature
      coverFeatureId: null,
      setCoverFeatureId: (featureId) => set({ coverFeatureId: featureId }),

      // Cover Lyrics
      coverLyrics: null,
      setCoverLyrics: (lyrics) => set({ coverLyrics: lyrics }),

      // Clear audio result
      clearAudioResult: () =>
        set({ audioUrl: null, audioHex: null, musicDuration: null }),
    }),
    {
      name: 'music-master-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        mode: state.mode,
        isDark: state.isDark,
        style: state.style,
      }),
    }
  )
)
