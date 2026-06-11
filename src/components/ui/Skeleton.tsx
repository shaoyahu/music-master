import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <div role="status" aria-label="加载中">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded bg-fg-muted/20',
            i > 0 && 'mt-2',
            className,
          )}
        />
      ))}
      <span className="sr-only">加载中...</span>
    </div>
  )
}
