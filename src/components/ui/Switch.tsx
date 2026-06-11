import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  className?: string
}

export function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-2', className)}>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-border',
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'block h-4 w-4 rounded-full bg-bg-elevated shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </SwitchPrimitive.Root>
      {label && <span className="text-sm text-fg">{label}</span>}
    </label>
  )
}
