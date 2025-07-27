import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 بايت"
  const k = 1024
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "الآن"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقيقة`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعة`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} يوم`
  return formatDate(date)
}
