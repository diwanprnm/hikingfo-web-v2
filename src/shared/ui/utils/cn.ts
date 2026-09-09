import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** shadcn-vue class merge helper (007). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
