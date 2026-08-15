import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names and resolves Tailwind conflicts, so a component's default
 * classes can be overridden by a caller's className prop without specificity
 * guesswork: cn('px-4', className) with className='px-6' yields px-6.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
