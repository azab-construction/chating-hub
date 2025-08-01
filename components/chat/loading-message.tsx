"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from "lucide-react"

export function LoadingMessage() {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="max-w-[80%]">
        <div className="rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center space-x-1 space-x-reverse">
            <div className="flex space-x-1 space-x-reverse">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">جاري الكتابة...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
