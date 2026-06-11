import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className，处理冲突的 Tailwind 类
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
