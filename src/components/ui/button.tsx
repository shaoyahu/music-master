import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button as AnimalButton } from 'animal-island-ui'
import { useIsAnimalStyle } from './StyleWrapper'

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-warm-600 text-warm-50 shadow hover:bg-warm-700 active:bg-warm-800",
        secondary:
          "bg-warm-200 text-warm-900 shadow-sm hover:bg-warm-300 active:bg-warm-400",
        outline:
          "border-2 border-warm-400 bg-transparent text-warm-800 shadow-sm hover:bg-warm-100 hover:border-warm-500 active:bg-warm-200",
        ghost:
          "text-warm-800 hover:bg-warm-200 active:bg-warm-300 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        link: "text-warm-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const variantMap: Record<string, string> = {
  default: 'primary',
  secondary: 'default',
  outline: 'default',
  ghost: 'text',
  link: 'link',
}

const sizeMap: Record<string, string> = {
  default: 'middle',
  sm: 'small',
  lg: 'large',
  icon: 'small',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const isAnimal = useIsAnimalStyle()

    if (isAnimal) {
      const btnType = (variant && variantMap[variant]) as 'primary' | 'default' | 'dashed' | 'text' | 'link' | undefined
      const btnSize = (size && sizeMap[size]) as 'small' | 'middle' | 'large' | undefined
      const { type: nativeType, ...rest } = props
      void nativeType
      return (
        <AnimalButton
          type={btnType || 'primary'}
          size={btnSize || 'middle'}
          className={className}
          {...rest}
        />
      )
    }

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
