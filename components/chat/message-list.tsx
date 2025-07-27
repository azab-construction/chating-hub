"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageItem } from "@/components/chat/message-item"
import { LoadingMessage } from "@/components/chat/loading-message"
import type { Message } from "@/types/chat"

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <ScrollArea className="h-full">
      <div ref={scrollRef} className="p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {isLoading && <LoadingMessage />}
      </div>
    </ScrollArea>
  )
}
