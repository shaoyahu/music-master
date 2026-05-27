import { Palette, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export type Style = 'warm' | 'nature' | 'cyberpunk' | 'blue' | 'cartoon' | 'minimal' | 'retro' | 'dark' | 'pink'

interface StyleSelectorProps {
  value: Style
  onChange: (style: Style) => void
  isDark?: boolean
  borderColor?: string
  labelColor?: string
}

const styles = [
  {
    id: 'warm' as Style,
    name: '温暖自然',
    description: '柔和暖色调，适合创作氛围',
    colors: ['#fef7f0', '#fdedd5', '#f6be74', '#e87d1e'],
  },
  {
    id: 'nature' as Style,
    name: '清新自然',
    description: '绿色森林系，清新舒适',
    colors: ['#f0fdf4', '#dcfce7', '#86efac', '#22c55e'],
  },
  {
    id: 'cyberpunk' as Style,
    name: '赛博朋克',
    description: '霓虹色彩，潮流科技感',
    colors: ['#0f172a', '#1e293b', '#06b6d4', '#8b5cf6'],
  },
  {
    id: 'blue' as Style,
    name: '蓝色主题',
    description: '静谧海洋蓝，高级商务感',
    colors: ['#eff6ff', '#dbeafe', '#60a5fa', '#3b82f6'],
  },
  {
    id: 'cartoon' as Style,
    name: '卡通风格',
    description: '活泼可爱的卡通配色',
    colors: ['#fef9c3', '#fde047', '#facc15', '#eab308'],
  },
  {
    id: 'minimal' as Style,
    name: '极简风格',
    description: '黑白灰极简，优雅克制',
    colors: ['#fafafa', '#e5e5e5', '#a3a3a3', '#404040'],
  },
  {
    id: 'retro' as Style,
    name: '复古风格',
    description: '怀旧胶片感，温暖复古',
    colors: ['#fff7ed', '#fed7aa', '#fb923c', '#c2410c'],
  },
  {
    id: 'dark' as Style,
    name: '暗夜风格',
    description: '深邃暗色调，沉浸体验',
    colors: ['#18181b', '#27272a', '#71717a', '#f4f4f5'],
  },
  {
    id: 'pink' as Style,
    name: '浅绿清新',
    description: '清新淡绿色，舒适护眼',
    colors: ['#f5fffe', '#e6f9f0', '#c3f5db', '#86efac'],
  },
]

export function StyleSelector({ value, onChange, isDark = false, borderColor = '#e5e5e5', labelColor = '#666' }: StyleSelectorProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
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
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <Palette className="h-5 w-5" style={{ color: labelColor }} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>选择风格</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => onChange(style.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '14px',
                border: `2px solid ${value === style.id ? style.colors[3] : '#e5e5e5'}`,
                backgroundColor: value === style.id ? `${style.colors[3]}15` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow: value === style.id ? `0 4px 12px ${style.colors[3]}30` : 'none',
              }}
            >
              {/* Color Preview */}
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
                {style.colors.map((color, i) => (
                  <div
                    key={i}
                    style={{ width: '32px', height: '40px', backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: isDark ? '#eee' : '#333' }}>{style.name}</div>
                <div style={{ fontSize: '13px', color: isDark ? '#888' : '#666', marginTop: '2px' }}>{style.description}</div>
              </div>

              {/* Selected Indicator */}
              {value === style.id && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: style.colors[3], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
