/**
 * src/lib/utils.ts
 *
 * Shared utility functions.
 * cn() is the Shadcn standard class name merger.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names intelligently.
 *
 * Usage:
 *   cn("px-4 py-2", condition && "font-bold", "text-sm")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
