"use client"

import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">جاري التحميل...</h2>
        <p className="text-gray-600 dark:text-gray-400">يرجى الانتظار قليلاً</p>
      </div>
    </div>
  )
}
