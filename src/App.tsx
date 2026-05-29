import { MusicGenerator } from '@/components/music'
import { LyricsPanel, LyricsExample } from '@/components/lyrics'
import { CoverProcessor } from '@/components/cover'
import { AudioResultPanel } from '@/components/AudioResultPanel'
import { StyleSelector } from '@/components/StyleSelector'
import { useAppStore, styleColors } from '@/stores/appStore'
import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Key, Eye, EyeOff } from 'lucide-react'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { MobilePlayerPage } from '@/components/layout/MobilePlayerPage'
import { MobileLyricsDrawer } from '@/components/layout/MobileLyricsDrawer'
import { MePage } from '@/components/layout/MePage'
import { Toast, useToast } from '@/components/ui/Toast'
import { useResponsive } from '@/hooks/useResponsive'

function App() {
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const activeTab = useAppStore((state) => state.mode)
  const setActiveTab = useAppStore((state) => state.setMode)
  const isDark = useAppStore((state) => state.isDark)
  const setIsDark = useAppStore((state) => state.setIsDark)
  const lyricsPanelOpen = useAppStore((state) => state.lyricsPanelOpen)
  const setLyricsPanelOpen = useAppStore((state) => state.setLyricsPanelOpen)
  const lyricsExampleOpen = useAppStore((state) => state.lyricsExampleOpen)
  const style = useAppStore((state) => state.style)
  const apiKey = useAppStore((state) => state.apiKey)
  const setApiKey = useAppStore((state) => state.setApiKey)
  const [tempApiKey, setTempApiKey] = useState(apiKey)
  const { isMobile } = useResponsive()
  const [mobileTab, setMobileTab] = useState<'music' | 'cover' | 'player' | 'lyrics' | 'me'>('music')
  const [lyricsDrawerOpen, setLyricsDrawerOpen] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const colors = styleColors[style]

  const bgGradient = style === 'warm' ? 'from-amber-50 via-orange-50 to-amber-100'
    : style === 'nature' ? 'from-green-50 via-emerald-50 to-teal-50'
    : 'from-slate-800 via-slate-900 to-slate-800'

  const audioResultPanelOpen = useAppStore((state) => state.audioResultPanelOpen)
  const setAudioResultPanelOpen = useAppStore((state) => state.setAudioResultPanelOpen)
  const musicPlaylist = useAppStore((state) => state.musicPlaylist)

  const headerBg = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)'
  const sidebarBg = isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)'
  const borderColor = isDark ? colors.borderDark : colors.border
  const labelColor = isDark ? colors.labelDark : colors.label
  const inputBg = isDark ? colors.inputBgDark : colors.inputBg

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${bgGradient}`}
      style={{ color: isDark ? '#eee' : '#333' }}
    >
      {/* Toast for mobile */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {isMobile ? (
        /* MOBILE LAYOUT */
        <>
          <MobileHeader colors={colors} isDark={isDark} />

          <main className="pt-14 pb-20 h-screen overflow-auto">
            {mobileTab === 'music' && <MusicGenerator />}
            {mobileTab === 'cover' && <CoverProcessor />}
            {mobileTab === 'player' && <MobilePlayerPage />}
            {mobileTab === 'lyrics' && (
              <div className="p-4">
                <div className="text-center py-12" style={{ color: isDark ? '#888' : '#999' }}>
                  歌词功能
                </div>
              </div>
            )}
            {mobileTab === 'me' && <MePage onApiKeyDialogOpen={() => setApiKeyDialogOpen(true)} />}
          </main>

          <MobileLyricsDrawer
            open={lyricsDrawerOpen}
            onClose={() => setLyricsDrawerOpen(false)}
            colors={colors}
            isDark={isDark}
          />

          <MobileTabBar
            activeTab={mobileTab}
            onTabChange={setMobileTab}
            isPlaying={musicPlaylist.length > 0}
            colors={colors}
            isDark={isDark}
          />
        </>
      ) : (
        /* DESKTOP LAYOUT */
        <>
          {/* Header */}
          <header
            className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b h-14"
            style={{
              backgroundColor: headerBg,
              borderColor: borderColor
            }}
          >
            <div className="h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎵</span>
                <h1 className="text-xl font-bold">音乐生成器</h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setApiKeyDialogOpen(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${colors.accent}`,
                    backgroundColor: colors.accent,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    boxShadow: `0 2px 8px ${colors.accent}40`,
                  }}
                >
                  <Key className="h-4 w-4" />
                  API Key
                </button>
                <button
                  onClick={() => setIsDark(!isDark)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: `2px solid ${borderColor}`,
                    backgroundColor: isDark ? 'rgba(60,60,60,0.8)' : 'rgba(255,255,255,0.9)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    fontSize: '16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
                <StyleSelector value={style} onChange={useAppStore.getState().setStyle} isDark={isDark} borderColor={borderColor} labelColor={labelColor} />
              </div>
            </div>
          </header>

          {/* API Key Dialog */}
          <Dialog.Root open={apiKeyDialogOpen} onOpenChange={(open) => {
            setApiKeyDialogOpen(open)
            if (open) {
              setTempApiKey(apiKey)
              setShowApiKey(false)
            }
          }}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
              <Dialog.Content
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 w-full max-w-md shadow-xl"
                style={{
                  backgroundColor: isDark ? '#2a2a2a' : '#fff',
                  border: `2px solid ${borderColor}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title style={{ color: labelColor, fontSize: '18px', fontWeight: 600 }}>
                    API Key 设置
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <X className="h-5 w-5" style={{ color: labelColor }} />
                    </button>
                  </Dialog.Close>
                </div>

                <Dialog.Description style={{ color: isDark ? '#888' : '#666', fontSize: '14px', marginBottom: '16px' }}>
                  请输入您的 MiniMax API Key 以启用音乐生成功能。密钥将安全保存在本地浏览器中。
                </Dialog.Description>

                <div style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="api-key"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: labelColor,
                      marginBottom: '8px'
                    }}
                  >
                    API Key
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="请输入 API Key"
                      style={{
                        width: '100%',
                        padding: '12px 48px 12px 16px',
                        borderRadius: '12px',
                        border: `2px solid ${borderColor}`,
                        backgroundColor: inputBg,
                        color: isDark ? '#eee' : '#333',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-5 w-5" style={{ color: isDark ? '#888' : '#b45309' }} />
                      ) : (
                        <Eye className="h-5 w-5" style={{ color: isDark ? '#888' : '#b45309' }} />
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setApiKey(tempApiKey)
                      setApiKeyDialogOpen(false)
                      setShowApiKey(false)
                    }}
                    style={{
                      flex: '1',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: colors.accent,
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    确定
                  </button>
                  <button
                    onClick={() => {
                      setApiKey('')
                      setTempApiKey('')
                      setApiKeyDialogOpen(false)
                      setShowApiKey(false)
                    }}
                    style={{
                      flex: '1',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid #ef4444`,
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    清除
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Sidebar */}
          <nav
            className="fixed left-0 top-14 bottom-0 w-20 z-30 backdrop-blur-md flex flex-col items-center py-6 gap-4 border-r"
            style={{
              backgroundColor: sidebarBg,
              borderColor: borderColor
            }}
          >
            <button
              onClick={() => setActiveTab('music')}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                border: `2px solid ${activeTab === 'music' ? colors.sidebarActive : 'transparent'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === 'music' ? colors.sidebarActive : isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)',
                color: activeTab === 'music' ? '#fff' : isDark ? '#aaa' : '#666',
                boxShadow: activeTab === 'music' ? `0 4px 12px ${colors.sidebarActive}40` : 'none',
              }}
            >
              <span style={{ fontSize: '24px' }}>🎵</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>音乐</span>
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                border: `2px solid ${activeTab === 'cover' ? colors.sidebarActive : 'transparent'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === 'cover' ? colors.sidebarActive : isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)',
                color: activeTab === 'cover' ? '#fff' : isDark ? '#aaa' : '#666',
                boxShadow: activeTab === 'cover' ? `0 4px 12px ${colors.sidebarActive}40` : 'none',
              }}
            >
              <span style={{ fontSize: '24px' }}>🔄</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>翻唱</span>
            </button>
            <button
              onClick={() => setLyricsPanelOpen(true)}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                border: `2px solid ${lyricsPanelOpen ? colors.sidebarActive : 'transparent'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: lyricsPanelOpen ? colors.sidebarActive : isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)',
                color: lyricsPanelOpen ? '#fff' : isDark ? '#aaa' : '#666',
                boxShadow: lyricsPanelOpen ? `0 4px 12px ${colors.sidebarActive}40` : 'none',
              }}
            >
              <span style={{ fontSize: '24px' }}>🎤</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>歌词</span>
            </button>
            <button
              onClick={() => setAudioResultPanelOpen(!audioResultPanelOpen)}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                border: `2px solid ${audioResultPanelOpen && musicPlaylist.length > 0 ? colors.sidebarActive : 'transparent'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: audioResultPanelOpen && musicPlaylist.length > 0 ? colors.sidebarActive : isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)',
                color: audioResultPanelOpen && musicPlaylist.length > 0 ? '#fff' : isDark ? '#aaa' : '#666',
                boxShadow: audioResultPanelOpen && musicPlaylist.length > 0 ? `0 4px 12px ${colors.sidebarActive}40` : 'none',
                marginTop: 'auto',
              }}
            >
              <span style={{ fontSize: '24px' }}>📻</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>播放器</span>
            </button>
          </nav>

          {/* Main Content Area */}
          <main
            className="fixed top-14 left-20 right-0 bottom-0 overflow-auto"
            style={{ padding: '24px' }}
          >
            <div
              className="h-full"
              style={{
                display: 'flex',
                gap: '24px',
                height: '100%',
                transition: 'justify-content 0.3s ease-in-out',
                width: '100%',
                maxWidth: '100%',
                justifyContent: (lyricsPanelOpen || lyricsExampleOpen) ? 'flex-start' : 'center',
              }}
            >
              {/* Music card - spans 2 cols when alone, 1 when panels open */}
              <div
                style={{
                  height: '100%',
                  flex: `0 0 ${(lyricsPanelOpen && lyricsExampleOpen) ? '33.3333%' : '66.6667%'}`,
                  minWidth: 0,
                  transition: 'flex-basis 0.3s ease-in-out',
                }}
              >
                {activeTab === 'music' && <MusicGenerator />}
                {activeTab === 'cover' && <CoverProcessor />}
              </div>

              {/* Lyrics Panel */}
              <div
                style={{
                  height: '100%',
                  flex: lyricsPanelOpen ? '1' : '0',
                  minWidth: 0,
                  opacity: lyricsPanelOpen ? 1 : 0,
                  pointerEvents: lyricsPanelOpen ? 'auto' : 'none',
                  transition: 'flex 0.3s ease-in-out, opacity 0.2s ease-in-out',
                }}
              >
                {lyricsPanelOpen && <LyricsPanel />}
              </div>

              {/* Lyrics Example */}
              <div
                style={{
                  height: '100%',
                  flex: lyricsExampleOpen ? '1' : '0',
                  minWidth: 0,
                  opacity: lyricsExampleOpen ? 1 : 0,
                  pointerEvents: lyricsExampleOpen ? 'auto' : 'none',
                  transition: 'flex 0.3s ease-in-out, opacity 0.2s ease-in-out',
                }}
              >
                {lyricsExampleOpen && <LyricsExample />}
              </div>
            </div>
          </main>

          {/* Floating Audio Player - always rendered */}
          <AudioResultPanel />
        </>
      )}
    </div>
  )
}

export default App
