import { useState, type ChangeEvent } from 'react'
import { Upload, FileAudio, Wand2, Music } from 'lucide-react'
import { useCoverStore } from '@/stores/coverStore'
import { useCoverPreprocess } from '@/hooks/useCoverPreprocess'
import { useCoverGeneration } from '@/hooks/useCoverGeneration'
import { useNcmDecrypt } from '@/hooks/useNcmDecrypt'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatBytes, formatDuration } from '@/lib/utils/format'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils/cn'

export function CoverStudioView() {
  const { fileName, fileSize, preprocessResult, prompt, setPrompt, clearAll } = useCoverStore()
  const preprocess = useCoverPreprocess()
  const generation = useCoverGeneration()
  const { decryptNcm, loading: ncmLoading, progress } = useNcmDecrypt()
  const { toast } = useToast()
  const [dragOver, setDragOver] = useState(false)

  const onFileSelect = async (file: File) => {
    const isNcm = file.name.toLowerCase().endsWith('.ncm')
    if (isNcm) {
      try {
        const decrypted = await decryptNcm(file)
        if (decrypted) {
          // 用解密后的 blob 走预处理
          await preprocess.run({ name: file.name.replace(/\.ncm$/, '.mp3'), size: decrypted.audio.byteLength })
          toast('NCM 解密成功', `${formatBytes(decrypted.audio.byteLength)}`)
        }
      } catch (e) {
        toast('NCM 解密失败', e instanceof Error ? e.message : '未知错误')
      }
    } else {
      await preprocess.run({ name: file.name, size: file.size })
    }
  }

  const onGenerate = async () => {
    if (!preprocessResult) {
      toast('请先上传并预处理音频', '未检测到可用的源音频')
      return
    }
    if (!prompt.trim()) {
      toast('请输入翻唱风格描述')
      return
    }
    await generation.run()
  }

  return (
    <div className="space-y-4">
      <Card title="翻唱处理" description="上传音频，自动提取特征并生成新版本">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) onFileSelect(file)
          }}
          className={cn(
            'rounded border-2 border-dashed p-6 text-center transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            dragOver ? 'border-primary bg-primary/5' : 'border-border',
          )}
          tabIndex={0}
          role="button"
          aria-label="拖拽音频文件到此处或点击选择"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              document.getElementById('cover-file')?.click()
            }
          }}
        >
          <input
            id="cover-file"
            type="file"
            accept="audio/*,.ncm"
            className="sr-only"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              if (file) onFileSelect(file)
            }}
          />
          <Upload className="mx-auto h-8 w-8 text-fg-muted" aria-hidden />
          <p className="mt-2 text-sm text-fg">拖拽文件到此处或点击上传</p>
          <p className="mt-1 text-xs text-fg-muted">支持 MP3 / FLAC / WAV / OGG / NCM</p>
        </div>

        {fileName && (
          <div className="mt-3 flex items-center justify-between rounded border border-border bg-bg p-3">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium text-fg">{fileName}</p>
                <p className="text-xs text-fg-muted">{formatBytes(fileSize)}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              清除
            </Button>
          </div>
        )}

        {ncmLoading && (
          <div className="mt-3">
            <p className="text-xs text-fg-muted mb-1">{progress.stage}...</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(progress.bytesProcessed / Math.max(progress.totalBytes, 1)) * 100}%` }}
                role="progressbar"
              />
            </div>
          </div>
        )}

        {preprocess.loading && (
          <div className="mt-3">
            <Skeleton count={3} className="h-4" />
          </div>
        )}

        {preprocessResult && (
          <div className="mt-3 rounded border border-border bg-bg p-3 text-sm">
            <p className="text-fg">
              <span className="text-fg-muted">时长：</span>
              {formatDuration(preprocessResult.duration)}
              <span className="ml-3 text-fg-muted">采样率：</span>
              {preprocessResult.sampleRate}Hz
            </p>
            {preprocessResult.metadata.bpm && (
              <p className="mt-1 text-fg">
                <span className="text-fg-muted">BPM：</span>
                {preprocessResult.metadata.bpm}
              </p>
            )}
            <p className="mt-2 text-xs text-fg-muted">
              提取歌词：{preprocessResult.detectedLyrics}
            </p>
          </div>
        )}
      </Card>

      <Card title="生成翻唱" description="输入风格描述，AI 将基于原曲特征生成新翻唱">
        <div className="space-y-3">
          <div>
            <label htmlFor="cover-prompt" className="block text-sm font-medium text-fg mb-1">
              风格描述 <span className="text-danger" aria-label="必填">*</span>
            </label>
            <textarea
              id="cover-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="例如：用女声翻唱，节奏加快，加入电子元素"
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {generation.errorMessage && (
            <p role="alert" className="text-sm text-danger">
              {generation.errorMessage}
            </p>
          )}

          <Button
            variant="primary"
            loading={generation.loading}
            onClick={onGenerate}
            icon={<Wand2 className="h-4 w-4" />}
          >
            {generation.loading ? '生成中...' : '生成翻唱'}
          </Button>
        </div>
      </Card>

      {generation.data && (
        <Card title="翻唱已生成" actions={<Music className="h-4 w-4 text-success" aria-hidden />}>
          <p className="text-sm text-fg">翻唱结果已就绪，可到右侧播放</p>
        </Card>
      )}
    </div>
  )
}
