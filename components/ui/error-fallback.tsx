"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        <Button onClick={resetErrorBoundary}>إعادة المحاولة</Button>
      </div>
    </div>
  )
}
