"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, Check, User, Bot, Paperclip } from "lucide-react"
import type { Message } from "@/types/chat"

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-lg p-3 ${
            isUser ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          }`}
        >
          <div className="prose prose-sm max-w-none">{message.content}</div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 text-sm opacity-80">
                  <Paperclip className="h-3 w-3" />
                  <span>{attachment.name}</span>
                  <span className="text-xs">({Math.round(attachment.size / 1024)} KB)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {message.timestamp.toLocaleTimeString("ar-SA", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {!isUser && (
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 w-6 p-0">
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
