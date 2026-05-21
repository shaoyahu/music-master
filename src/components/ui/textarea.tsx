import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border-2 border-warm-300 bg-warm-50 px-4 py-3 text-sm text-warm-900 shadow-sm transition-colors placeholder:text-warm-500 focus:outline-none focus:border-warm-500 focus:ring-2 focus:ring-warm-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-100",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
