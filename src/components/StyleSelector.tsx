import { useRef } from 'react'
import { Palette, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export type Style = 'warm' | 'nature' | 'cyberpunk' | 'blue' | 'cartoon' | 'minimal' | 'retro' | 'dark' | 'pink' | 'animal'

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
  {
    id: 'animal' as Style,
    name: '动物森友会',
    description: '温馨可爱，童趣盎然',
    colors: ['#f8f8f0', '#f0e8d8', '#c4b89e', '#19c8b9'],
  },
]

export function StyleSelector({ value, onChange, isDark = false, borderColor = '#e5e5e5', labelColor = '#666' }: StyleSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

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
      <DialogContent
        className="sm:max-w-md"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {/* Fixed Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: `1px solid ${isDark ? '#333' : '#e5e5e5'}`,
          flexShrink: 0,
        }}>
          <DialogTitle style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: isDark ? '#eee' : '#333' }}>
            选择风格
          </DialogTitle>
        </div>

        {/* Scrollable List */}
        <div
          ref={scrollRef}
          className="grid gap-2"
          style={{
            padding: '12px 16px',
            maxHeight: 'calc(70vh - 70px)',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => onChange(style.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: `2px solid ${value === style.id ? style.colors[3] : '#e5e5e5'}`,
                backgroundColor: value === style.id ? `${style.colors[3]}15` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow: value === style.id ? `0 2px 8px ${style.colors[3]}25` : 'none',
              }}
            >
              {/* Color Preview */}
              <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                {style.colors.map((color, i) => (
                  <div
                    key={i}
                    style={{ width: '20px', height: '28px', backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: isDark ? '#eee' : '#333' }}>{style.name}</div>
                <div style={{ fontSize: '12px', color: isDark ? '#888' : '#666', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{style.description}</div>
              </div>

              {/* Selected Indicator */}
              {value === style.id && (
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: style.colors[3],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
