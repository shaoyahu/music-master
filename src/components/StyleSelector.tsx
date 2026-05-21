import { Palette, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type Style = 'warm' | 'nature' | 'cyberpunk'

interface StyleSelectorProps {
  value: Style
  onChange: (style: Style) => void
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
]

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Palette className="h-5 w-5" />
        </Button>
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
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                value === style.id
                  ? "border-warm-500 bg-warm-50"
                  : "border-warm-200 hover:border-warm-300 hover:bg-warm-50"
              )}
            >
              {/* Color Preview */}
              <div className="flex rounded-lg overflow-hidden">
                {style.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="font-medium text-warm-900">{style.name}</div>
                <div className="text-sm text-warm-600">{style.description}</div>
              </div>

              {/* Selected Indicator */}
              {value === style.id && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-500 text-white">
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
