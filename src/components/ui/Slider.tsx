import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils/cn'

interface SliderProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1, label, className }: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <label className="text-sm font-medium text-fg">{label}</label>}
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="relative flex h-5 w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1.5 grow rounded-full bg-border">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={label}
          className="block h-4 w-4 rounded-full border-2 border-primary bg-bg-elevated shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        />
      </SliderPrimitive.Root>
    </div>
  )
}
