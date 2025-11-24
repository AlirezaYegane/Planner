import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date {
    return new Date(dateString);
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getToday(): string {
    return formatDate(new Date());
}

/**
 * Calculate completion percentage
 */
export function calculateCompletion(total: number, completed: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}
