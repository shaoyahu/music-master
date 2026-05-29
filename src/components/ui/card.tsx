import * as React from "react"
import { Card as AnimalCard } from 'animal-island-ui'
import { useIsAnimalStyle } from './StyleWrapper'
import { styleColors } from '@/stores/appStore'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Card({ children, className, style, ...props }: CardProps) {
  const isAnimal = useIsAnimalStyle()
  const isDark = useAppStore((state) => state.isDark)
  const styleType = useAppStore((state) => state.style)
  const colors = styleColors[styleType]

  if (isAnimal) {
    return (
      <AnimalCard
        className={className}
        style={style}
        {...props}
      >
        {children}
      </AnimalCard>
    )
  }

  return (
    <div
      className={cn("rounded-2xl p-6 shadow-lg border", className)}
      style={{
        background: isDark ? colors.cardBgDark : colors.cardBg,
        borderColor: isDark ? colors.borderDark : colors.border,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
